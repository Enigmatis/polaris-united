import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { isMutation } from '@enigmatis/polaris-middlewares';
import {
    GraphQLRequestContext,
    GraphQLRequestListener,
    GraphQLResponse,
} from 'apollo-server-plugin-base';
import { PolarisServerConfig } from '../..';
import { calculatePageSize } from '../../utils/snapshot-util';

export class OnlinePaginationListener implements GraphQLRequestListener<PolarisGraphQLContext> {
    public constructor(private readonly config: PolarisServerConfig) {}

    public didResolveOperation(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
    ): Promise<void> | void {
        const { context } = requestContext;
        if (this.isOnlinePaginatedRequest(context, requestContext.request.query)) {
            return (async (): Promise<void> => {})();
        }
    }

    public responseForOperation(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
    ): Promise<GraphQLResponse | null> | GraphQLResponse | null {
        const { context } = requestContext;

        if (context.snapshotContext) {
            return {
                data: [],
            };
        }
        return null;
    }


    private fillContextWithSnapshotMetadata(
        context: PolarisGraphQLContext,
        totalCount: number,
        dataVersion: any,
    ) {
        context.onlinePaginatedContext = {
            pageSize: calculatePageSize(
                this.config.snapshotConfig.maxPageSize,
                context?.requestHeaders?.pageSize,
            ),
        };
    }
}
