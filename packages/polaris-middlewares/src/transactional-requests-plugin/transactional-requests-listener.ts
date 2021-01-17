import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { PolarisConnection, PolarisEntityManager } from '@enigmatis/polaris-typeorm';
import {
    GraphQLRequestContext,
    GraphQLRequestListener,
    ValueOrPromise,
    WithRequired,
} from 'apollo-server-plugin-base';
import {
    LISTENER_COMMITTING_MESSAGE,
    LISTENER_FINISHED_JOB,
    LISTENER_ROLLING_BACK_MESSAGE,
} from './transactional-requests-messages';

export class TransactionalRequestsListener
    implements GraphQLRequestListener<PolarisGraphQLContext> {
    private readonly logger: PolarisGraphQLLogger;
    private readonly connection: PolarisConnection;
    private readonly entityManager: PolarisEntityManager;

    constructor(
        logger: PolarisGraphQLLogger,
        connection: PolarisConnection,
        context: PolarisGraphQLContext,
    ) {
        this.logger = logger;
        this.connection = connection;
        this.entityManager =
            this.connection.getPolarisEntityManager(context) ??
            new PolarisEntityManager(connection, connection.createQueryRunner(), context);

        this.connection.addPolarisEntityManager(
            context.requestHeaders.requestId!,
            this.entityManager,
        );
    }

    public didResolveOperation(
        requestContext: WithRequired<
            GraphQLRequestContext<PolarisGraphQLContext>,
            'metrics' | 'source' | 'document' | 'operationName' | 'operation'
        >,
    ): ValueOrPromise<void> {
        if (
            requestContext.operation.operation === 'query' &&
            requestContext.operation.selectionSet.selections.length > 1
        ) {
            return new Promise((resolve) => {
                this.entityManager.startTransaction().then(() => resolve());
            });
        }
    }

    public willSendResponse(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'response'>>,
    ) {
        if (
            requestContext.context.snapshotContext === undefined ||
            requestContext.context.snapshotContext.shouldCommitTransaction
        ) {
            const shouldRollback = !!(
                (requestContext.errors && requestContext.errors?.length > 0) ||
                (requestContext.response.errors && requestContext.response.errors?.length > 0)
            );
            return this.finishTransaction(requestContext.context, shouldRollback);
        }
    }
    private async finishTransaction(context: PolarisGraphQLContext, shouldRollback: boolean) {
        if (this.entityManager.queryRunner?.isTransactionActive) {
            if (shouldRollback) {
                await this.entityManager.queryRunner?.rollbackTransaction();
                this.logger.warn(LISTENER_ROLLING_BACK_MESSAGE, context);
            } else {
                await this.entityManager.queryRunner?.commitTransaction();
                this.logger.debug(LISTENER_COMMITTING_MESSAGE, context);
            }
        }
        if (!this.entityManager.queryRunner?.isReleased) {
            await this.entityManager.queryRunner?.release();
        }
        await this.connection.removePolarisEntityManager(context.requestHeaders.requestId!);
        this.logger.debug(LISTENER_FINISHED_JOB, context);
    }
}
