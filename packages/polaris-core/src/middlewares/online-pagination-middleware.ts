import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { calculatePageSize } from '../utils/paging-util';
import { PolarisServerConfig } from '../config/polaris-server-config';

export class OnlinePaginationMiddleware {
    public readonly logger: PolarisGraphQLLogger;
    public readonly config: PolarisServerConfig;

    constructor(logger: PolarisGraphQLLogger, config: PolarisServerConfig) {
        this.logger = logger;
        this.config = config;
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
            if (this.isNotPaginatedResolver(result, root)) {
                return result;
            }
            currentPage = await this.calculateCurrentPage(context, result);
            this.logger.debug('Online pagination middleware finished job', context);
            return currentPage;
        };
    }

    private isNotPaginatedResolver(result: any, root: any): boolean {
        return !(result && !result.totalCount && result.getData && !root);
    }

    private async calculateCurrentPage(context: PolarisGraphQLContext, result: any) {
        const pageSize = calculatePageSize(
            this.config.maxPageSize,
            context?.requestHeaders?.pageSize,
        );
        context.onlinePaginatedContext = { pageSize };
        return result.getData();
    }
}
