import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { calculatePageSize } from '../utils/paging-util';
import { PagingConfiguration } from '../config/paging-configuration';

export class OnlinePaginationMiddleware {
    public readonly logger: PolarisGraphQLLogger;
    public readonly pagingConfiguration: PagingConfiguration;

    constructor(logger: PolarisGraphQLLogger, pagingConfiguration: PagingConfiguration) {
        this.logger = logger;
        this.pagingConfiguration = pagingConfiguration;
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
        return !(
            result &&
            result.totalCount &&
            result.getData &&
            !root &&
            !context.requestHeaders.snapRequest
        );
    }

    private async calculateCurrentPage(context: PolarisGraphQLContext, result: any) {
        const pageSize = calculatePageSize(
            this.pagingConfiguration.maxPageSize,
            context?.requestHeaders?.pageSize,
        );
        const totalCount = await result.totalCount();
        context.onlinePaginatedContext = { pageSize, totalCount };
        return result.getData();
    }
}
