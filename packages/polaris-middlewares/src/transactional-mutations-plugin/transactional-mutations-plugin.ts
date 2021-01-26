import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { getConnectionForReality, PolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { isMutation } from '..';
import { TransactionalMutationsListener } from './transactional-mutations-listener';
import { PLUGIN_STARTED_JOB } from './transactional-mutations-messages';

export class TransactionalMutationsPlugin implements ApolloServerPlugin<PolarisGraphQLContext> {
    public readonly connectionManager: PolarisConnectionManager;
    private readonly logger: PolarisGraphQLLogger;
    private readonly realitiesHolder: RealitiesHolder;

    constructor(
        logger: PolarisGraphQLLogger,
        realitiesHolder: RealitiesHolder,
        connectionManager: PolarisConnectionManager,
    ) {
        this.logger = logger;
        this.realitiesHolder = realitiesHolder;
        this.connectionManager = connectionManager;
    }

    public requestDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext>,
    ): GraphQLRequestListener<PolarisGraphQLContext> | void {
        if (
            isMutation(requestContext.request.query) &&
            this.connectionManager?.connections?.length
        ) {
            this.logger.debug(PLUGIN_STARTED_JOB, requestContext.context);
            const realityId =
                requestContext.context.requestHeaders.realityId !== undefined
                    ? requestContext.context.requestHeaders.realityId
                    : 0;
            const connection = getConnectionForReality(
                realityId,
                this.realitiesHolder,
                this.connectionManager,
            );
            return new TransactionalMutationsListener(this.logger, connection);
        }
    }
}
