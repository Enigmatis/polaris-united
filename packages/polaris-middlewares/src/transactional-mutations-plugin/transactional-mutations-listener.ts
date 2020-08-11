import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {PolarisConnection, QueryRunner} from '@enigmatis/polaris-typeorm';
import { GraphQLRequestContext, GraphQLRequestListener, GraphQLResponse, ValueOrPromise, WithRequired } from 'apollo-server-plugin-base';
import {PARSING_BEGAN, PARSING_FINISHED, PARSING_FINISHED_WITH_ERROR} from "../logger-plugin/logger-plugin-messages";
import {
    LISTENER_COMMITTING_MESSAGE,
    LISTENER_FINISHED_JOB,
    LISTENER_ROLLING_BACK_MESSAGE,
} from './transactional-mutations-messages';

export class TransactionalMutationsListener
    implements GraphQLRequestListener<PolarisGraphQLContext> {
    private readonly logger: PolarisGraphQLLogger;
    private queryRunner?: QueryRunner;
    private readonly connection: PolarisConnection;

    constructor(logger: PolarisGraphQLLogger, connection: PolarisConnection) {
        this.logger = logger;
        this.connection = connection;
    }

    public responseForOperation(
        requestContext: WithRequired<
            GraphQLRequestContext<PolarisGraphQLContext>,
            'metrics' | 'source' | 'document' | 'operationName' | 'operation' | "response" | "request" | "context" | "cache" | "queryHash" | "errors" | "debug"
            >,
    ): ValueOrPromise<GraphQLResponse|null> {
        this.queryRunner = this.connection.createQueryRunner()
        return this.startSerializableTransaction();
    }

    public async startSerializableTransaction (): Promise<null>{
        await this.queryRunner?.startTransaction('SERIALIZABLE');
        return null;
    }


    public willSendResponse(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'response'>>,
    ): Promise<void> {
        const shouldRollback = !!((requestContext.errors && requestContext.errors?.length > 0) ||
            (requestContext.response.errors && requestContext.response.errors?.length > 0));
        return this.finishTransaction(requestContext.context, shouldRollback);
    }
    private async finishTransaction(context: PolarisGraphQLContext, shouldRollback: boolean) {
        if (this.queryRunner?.isTransactionActive) {
            if (shouldRollback) {
                await this.rollbackTransaction(context);
            } else {
                await this.commitTransaction(context)
            }
            await this.queryRunner?.release();
        }
        this.logger.debug(LISTENER_FINISHED_JOB, context);
    }
    private async rollbackTransaction(context: PolarisGraphQLContext) {
        await this.queryRunner?.rollbackTransaction();
        this.logger.warn(LISTENER_ROLLING_BACK_MESSAGE, context);
    }
    private async commitTransaction(context: PolarisGraphQLContext): Promise<void> {
        await this.queryRunner?.commitTransaction();
        this.logger.debug(LISTENER_COMMITTING_MESSAGE, context);
    }
}
