import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    GraphQLRequestContext,
    GraphQLRequestListener,
    GraphQLResponse,
} from 'apollo-server-plugin-base';
import {
    EXECUTION_BEGAN,
    EXECUTION_FINISHED,
    EXECUTION_FINISHED_WITH_ERROR,
    PARSING_BEGAN,
    PARSING_FINISHED,
    PARSING_FINISHED_WITH_ERROR,
    RESPONSE_SENT,
    VALIDATION_BEGAN,
    VALIDATION_FINISHED,
    VALIDATION_FINISHED_WITH_ERROR,
} from './logger-plugin-messages';
import { DocumentNode } from 'graphql';

export class PolarisRequestListener implements GraphQLRequestListener<PolarisGraphQLContext> {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public willSendResponse(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'response'>>,
    ): Promise<void> | void {
        const { context, response } = requestContext;
        const loggedResponse = {
            data: response.data,
            errors: response.errors,
            extensions: response.extensions,
        };
        const elapsedTime = context.requestStartedTime && Date.now() - context.requestStartedTime;
        const headers = response.http?.headers;
        this.logger.info(RESPONSE_SENT, context, {
            eventKind: EventCode.RESPONSE,
            response: loggedResponse,
            elapsedTime,
            customProperties: {
                responseHeaders: headers && [...headers],
                esc_doc_id: context.logDocumentId,
                affectedEntitiesCount: this.calculateAffectedEntitiesCount(response),
            },
        });
    }

    private calculateAffectedEntitiesCount(response: GraphQLResponse) {
        let affectedEntitiesCount = 0;
        if (response.data) {
            Object.values(response.data).map(
                (x) => (affectedEntitiesCount += x instanceof Array ? x.length : 1),
            );
        }
        return affectedEntitiesCount;
    }

    public executionDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
    ): ((err?: Error) => void) | void {
        const { context } = requestContext;
        this.logger.debug(EXECUTION_BEGAN, context);
        return (err) => {
            if (err) {
                this.logger.debug(EXECUTION_FINISHED_WITH_ERROR, context);
            } else {
                this.logger.debug(EXECUTION_FINISHED, context);
            }
        };
    }

    public parsingDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'source'>>,
    ): ((err?: Error) => void) | void {
        const { context } = requestContext;
        this.logger.debug(PARSING_BEGAN, context);
        return (err) => {
            if (err) {
                this.logger.debug(PARSING_FINISHED_WITH_ERROR, context);
            } else {
                this.logger.debug(PARSING_FINISHED, context);
            }
        };
    }

    public validationDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document'
                >
            >,
    ): ((err?: ReadonlyArray<Error>) => void) | void {
        const { context, document } = requestContext;
        this.logger.info(VALIDATION_BEGAN, context, {
            customProperties: {
                queryName: this.getQueryName(document),
                esc_doc_id: context.logDocumentId,
            },
        });
        return (err) => {
            if (err) {
                this.logger.debug(VALIDATION_FINISHED_WITH_ERROR, context);
            } else {
                this.logger.debug(VALIDATION_FINISHED, context);
            }
        };
    }

    private getQueryName(document: DocumentNode) {
        const definitions: any = document.definitions;
        const querySelection = definitions && definitions[0]?.selectionSet?.selections;
        return querySelection && querySelection[0]?.name?.value;
    }
}
