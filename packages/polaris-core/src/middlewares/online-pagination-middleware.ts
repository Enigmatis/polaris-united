import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { calculatePageSize } from '../utils/paging-util';
import { SnapshotConfiguration } from '../config/snapshot-configuration';

export class OnlinePaginationMiddleware {
    public readonly logger: PolarisGraphQLLogger;
    public readonly snapshotConfiguration: SnapshotConfiguration;

    constructor(logger: PolarisGraphQLLogger, pagingConfiguration: SnapshotConfiguration) {
        this.logger = logger;
        this.snapshotConfiguration = pagingConfiguration;
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: any,
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Online pagination middleware started job', context);
            let currentPage: any[];
            const result = await resolve(root, args, context, info);
            if (this.isNotPaginatedResolver(result, root, context)) {
                return result;
            }
            currentPage = await this.calculateCurrentPage(context, result);
            this.logger.debug('Online pagination middleware finished job', context);
            return currentPage;
        };
    }

    private isNotPaginatedResolver(
        result: any,
        root: any,
        context: PolarisGraphQLContext,
    ): boolean {
        const x = !(
            result &&
            result.totalCount &&
            result.getData &&
            !root &&
            !context.requestHeaders.snapRequest
        );
        return x;
    }

    private async calculateCurrentPage(context: PolarisGraphQLContext, result: any) {
        const pageSize = calculatePageSize(
            this.snapshotConfiguration.maxPageSize,
            context?.requestHeaders?.pageSize,
        );
        const totalCount = await result.totalCount();
        context.onlinePaginatedContext = { pageSize, totalCount };
        context.returnedExtensions.totalCount = totalCount;
        return result.getData();
    }
}
