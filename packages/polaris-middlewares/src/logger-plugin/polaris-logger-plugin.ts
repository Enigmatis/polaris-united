import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { REQUEST_RECEIVED } from './logger-plugin-messages';
import { PolarisRequestListener } from './polaris-request-listener';
import { v4 as uuid } from 'uuid';

export class PolarisLoggerPlugin implements ApolloServerPlugin<PolarisGraphQLContext> {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public requestDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext>,
    ): GraphQLRequestListener<PolarisGraphQLContext> | void {
        const { context, request } = requestContext;
        context.requestStartedTime = Date.now();
        context.logDocumentId = uuid();
        const headers = request.http?.headers;
        this.logger.info(REQUEST_RECEIVED, context, {
            eventKind: EventCode.RECEIVE,
            customProperties: {
                requestHeaders: headers && [...headers],
                esc_doc_id: context.logDocumentId,
            },
        });
        return new PolarisRequestListener(this.logger);
    }
}
