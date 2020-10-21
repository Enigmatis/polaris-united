import {PolarisGraphQLContext} from '@enigmatis/polaris-common';
import {PolarisGraphQLLogger} from '@enigmatis/polaris-graphql-logger';
import {GraphQLRequestContext, GraphQLRequestListener, GraphQLServiceContext,} from 'apollo-server-plugin-base';

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
            if (!this.shouldAddWarningsToExtensions) {
                context.returnedExtensions.warnings = undefined;
            }
            const extensionsToReturn: any = {
                ...response.extensions,
                ...context.returnedExtensions,
            };
            if (schemaHash && extensionsToReturn.snapResponse) {
                delete extensionsToReturn.prefetchBuffer;
                delete extensionsToReturn.totalCount;
                delete extensionsToReturn.globalDataVersion;
            } else {
                delete extensionsToReturn.snapResponse;
            }
            response.extensions = extensionsToReturn;
        }
    }
}
