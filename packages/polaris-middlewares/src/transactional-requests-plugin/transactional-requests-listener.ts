import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { PolarisConnection, PolarisEntityManager } from '@enigmatis/polaris-typeorm';
import {
    GraphQLRequestContext,
    GraphQLRequestListener,
    GraphQLResponse,
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
            connection.getPolarisEntityManager(context) ??
            new PolarisEntityManager(connection, connection.createQueryRunner(), context);
    }

    public responseForOperation(
        requestContext: WithRequired<
            GraphQLRequestContext<PolarisGraphQLContext>,
            | 'metrics'
            | 'source'
            | 'document'
            | 'operationName'
            | 'operation'
            | 'response'
            | 'request'
            | 'context'
            | 'cache'
            | 'queryHash'
            | 'errors'
            | 'debug'
        >,
    ): ValueOrPromise<GraphQLResponse | null> {
        if (!this.connection.getPolarisEntityManager(requestContext.context)) {
            this.connection.addPolarisEntityManager(
                requestContext.context.requestHeaders.requestId!,
                this.entityManager,
            );
        }
        this.connection.addShouldCommitTransaction(
            requestContext.context.requestHeaders.requestId!,
            true,
        );
        return null;
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
        return TransactionalRequestsListener.closeTransaction(
            requestContext,
            this.logger,
            this.entityManager,
            this.connection,
        );
    }

    public static closeTransaction(
        requestContext: any,
        logger: PolarisGraphQLLogger,
        entityManager: PolarisEntityManager,
        connection: PolarisConnection,
    ) {
        if (
            connection.getShouldCommitTransaction(requestContext.context.requestHeaders.requestId!)
        ) {
            const shouldRollback = !!(
                (requestContext.errors && requestContext.errors?.length > 0) ||
                (requestContext.response.errors && requestContext.response.errors?.length > 0)
            );
            return TransactionalRequestsListener.finishTransaction(
                requestContext.context,
                shouldRollback,
                logger,
                entityManager,
                connection,
            );
        }
    }

    private static async finishTransaction(
        context: PolarisGraphQLContext,
        shouldRollback: boolean,
        logger: PolarisGraphQLLogger,
        entityManager: PolarisEntityManager,
        connection: PolarisConnection,
    ) {
        if (entityManager.queryRunner?.isTransactionActive) {
            if (shouldRollback) {
                await entityManager.queryRunner?.rollbackTransaction();
                logger.warn(LISTENER_ROLLING_BACK_MESSAGE, context);
            } else {
                await entityManager.queryRunner?.commitTransaction();
                logger.debug(LISTENER_COMMITTING_MESSAGE, context);
            }
        }
        if (!entityManager.queryRunner?.isReleased) {
            await entityManager.queryRunner?.release();
        }
        await connection.removePolarisEntityManager(context.requestHeaders.requestId!);
        logger.debug(LISTENER_FINISHED_JOB, context);
    }
}
