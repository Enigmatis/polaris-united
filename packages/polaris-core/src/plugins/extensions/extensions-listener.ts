import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    GraphQLRequestContext,
    GraphQLRequestListener,
    GraphQLServiceContext,
} from 'apollo-server-plugin-base';

export class ExtensionsListener implements GraphQLRequestListener<PolarisGraphQLContext> {
    public readonly logger: any;
    public readonly shouldAddWarningsToExtensions: boolean;

    constructor(logger: PolarisGraphQLLogger, shouldAddWarningsToExtensions: boolean) {
        this.logger = logger;
        this.shouldAddWarningsToExtensions = shouldAddWarningsToExtensions;
    }

    public async willSendResponse(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLServiceContext, 'schemaHash'>> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'response'>>,
    ): Promise<void> {
        const { context, response, schemaHash } = requestContext;

        if (context.returnedExtensions) {
            this.logger.debug('extensions were set to response');
            if (this.shouldAddWarningsToExtensions) {
                context.returnedExtensions.warnings = context.returnedExtensions.warnings ?? [];
                if (context.requestedDeprecatedFields.length) {
                    context.returnedExtensions.warnings!.push(
                        `The following requested field(s) are deprecated: ${context.requestedDeprecatedFields}`,
                    );
                }
            } else {
                context.returnedExtensions.warnings = undefined;
            }
            let onlinePagingExtensions = {};
            if (
                context.onlinePaginatedContext &&
                context.onlinePaginatedContext.lastIdInPage &&
                context.onlinePaginatedContext.lastDataVersionInPage &&
                !context.onlinePaginatedContext.isLastPage
            ) {
                onlinePagingExtensions = {
                    lastIdInDataVersion: context.onlinePaginatedContext.lastIdInPage,
                    lastDataVersionInPage: context.onlinePaginatedContext.lastDataVersionInPage,
                };
            }
            const extensionsToReturn: any = {
                ...onlinePagingExtensions,
                ...response.extensions,
                ...context.returnedExtensions,
            };
            if (schemaHash && extensionsToReturn.snapResponse) {
                delete extensionsToReturn.prefetchBuffer;
                delete extensionsToReturn.totalCount;
                delete extensionsToReturn.dataVersion;
            } else {
                delete extensionsToReturn.snapResponse;
            }
            response.extensions = extensionsToReturn;
        }
    }
}
