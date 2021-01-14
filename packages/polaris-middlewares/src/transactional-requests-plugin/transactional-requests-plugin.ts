import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { getConnectionForReality, PolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { TransactionalRequestsListener } from './transactional-requests-listener';
import { PLUGIN_STARTED_JOB } from './transactional-requests-messages';

export class TransactionalRequestsPlugin implements ApolloServerPlugin<PolarisGraphQLContext> {
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
        if (this.connectionManager?.connections?.length) {
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
            return new TransactionalRequestsListener(
                this.logger,
                connection,
                requestContext.context,
            );
        }
    }
}
