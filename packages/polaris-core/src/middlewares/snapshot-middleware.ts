import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { SnapshotPaginatedResolver, PolarisServerConfig } from '..';
import { calculatePageSize } from '../utils/paging-util';

export class SnapshotMiddleware {
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
            this.logger.debug('Snapshot middleware started job', context);
            let currentPage: any[];
            const result = await resolve(root, args, context, info);
            if (this.isNotPaginatedResolver(result, root)) {
                return result;
            }
            if (context.requestHeaders.snapRequest || this.config.snapshotConfig.autoSnapshot) {
                currentPage = await this.calculateCurrentPageInSnapshotProcess(context, result);
            } else {
                const totalCount =
                    context.returnedExtensions.totalCount ?? (await result.totalCount());
                if (totalCount < this.config.maxPageSize) {
                    currentPage = await result.getData(0, totalCount);
                } else {
                    throw new Error('snap-request header is missing');
                }
            }

            this.logger.debug('Snapshot middleware finished job', context);
            return currentPage;
        };
    }

    private isNotPaginatedResolver(result: any, root: any): boolean {
        return !(result && result.totalCount && result.getData && !root);
    }

    private async calculateCurrentPageInSnapshotProcess(
        context: PolarisGraphQLContext,
        result: any,
    ) {
        if (context.snapshotContext == null || !context.snapshotContext.startIndex) {
            const pageSize = calculatePageSize(
                this.config.maxPageSize,
                context?.requestHeaders?.pageSize,
            );
            await this.setCalculatePageSizeAccordingToTotalCount(result, pageSize, context);
            // if not auto snapshot and first request
            if (
                context.returnedExtensions.totalCount &&
                context.snapshotContext?.startIndex !== 0
            ) {
                return [];
            }
        }
        return this.fetchEntitiesWithBuffer(context, result);
    }

    private async setCalculatePageSizeAccordingToTotalCount(
        result: SnapshotPaginatedResolver<any>,
        pageSize: number,
        context: PolarisGraphQLContext,
    ) {
        const totalCount = await result.totalCount();
        if (!(this.config.snapshotConfig.autoSnapshot && totalCount <= pageSize)) {
            context.returnedExtensions.totalCount = totalCount;
        } else {
            // if auto snapshot and also less than a page
            pageSize = totalCount;
        }
        context.snapshotContext = { ...(context.snapshotContext || {}), pageSize };
    }

    private async fetchEntitiesWithBuffer(context: PolarisGraphQLContext, result: any) {
        const startIndex = context?.snapshotContext?.startIndex! || 0;
        const pageSize = context?.snapshotContext?.pageSize!;

        let prefetchBuffer = context.snapshotContext?.prefetchBuffer || [];

        if (prefetchBuffer.length < pageSize) {
            const fetchedData = await this.fetchMoreDataForBuffer(
                result,
                startIndex + prefetchBuffer.length,
                context?.returnedExtensions?.totalCount || pageSize,
            );
            prefetchBuffer = [...prefetchBuffer, ...(fetchedData || [])];
        }

        const currentPage = prefetchBuffer.splice(0, pageSize);

        if (prefetchBuffer.length > 0) {
            context.returnedExtensions.prefetchBuffer = prefetchBuffer;
        } else {
            delete context.returnedExtensions.prefetchBuffer;
        }
        const totalCount = context.returnedExtensions.totalCount ?? (await result.totalCount());
        if (this.isLastPage(pageSize, totalCount, startIndex)) {
            context.snapshotContext!.shouldCommitTransaction = true;
        }
        return currentPage;
    }

    private isLastPage(pageSize: number, totalCount: number, startIndex: number) {
        return pageSize && totalCount && startIndex + pageSize >= totalCount;
    }

    private fetchMoreDataForBuffer(result: any, startIndex: number, totalCount: number) {
        const endIndex = Math.min(
            startIndex + this.config.snapshotConfig.entitiesAmountPerFetch,
            totalCount,
        );
        const pageSize = endIndex - startIndex;
        return pageSize > 0 ? result.getData(startIndex, pageSize) : [];
    }
}
