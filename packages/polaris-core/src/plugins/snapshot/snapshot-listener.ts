import {
    IrrelevantEntitiesResponse,
    mergeIrrelevantEntities,
    PolarisGraphQLContext,
    PolarisRequestHeaders,
} from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { isMutation } from '@enigmatis/polaris-middlewares';
import {
    getConnectionForReality,
    PolarisConnectionManager,
    QueryRunner,
    Repository,
    SnapshotMetadata,
    SnapshotPage,
    SnapshotStatus,
} from '@enigmatis/polaris-typeorm';
import { runHttpQuery } from 'apollo-server-core';
import {
    GraphQLRequestContext,
    GraphQLRequestListener,
    GraphQLResponse,
} from 'apollo-server-plugin-base';
import { v4 as uuidv4 } from 'uuid';
import { PolarisServerConfig } from '../..';
import {
    getQueryRunner,
    getSnapshotMetadataRepository,
    getSnapshotPageRepository,
    releaseQueryRunner,
    saveSnapshotMetadata,
    saveSnapshotPages,
    updateSnapshotMetadata,
    updateSnapshotPage,
} from '../../utils/snapshot-connectionless-util';

export class SnapshotListener implements GraphQLRequestListener<PolarisGraphQLContext> {
    public static graphQLOptions: any;

    private static getRealityFromHeaders(context: PolarisGraphQLContext): number {
        return context.requestHeaders.realityId !== undefined
            ? context.requestHeaders.realityId
            : 0;
    }

    private static async sendQueryRequest(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
        context: PolarisGraphQLContext,
    ) {
        const httpRequest = requestContext.request.http!;
        const currentPageResult = await runHttpQuery([], {
            method: httpRequest.method,
            request: httpRequest,
            query: requestContext.request,
            options: {
                ...SnapshotListener.graphQLOptions,
                context,
            },
        });
        return JSON.parse(currentPageResult.graphqlResponse);
    }

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

        if (
            (!context.requestHeaders.snapRequest && !this.config.snapshotConfig.autoSnapshot) ||
            isMutation(requestContext.request.query)
        ) {
            return;
        }

        return (async (): Promise<void> => {
            const { requestHeaders } = context;
            const queryRunner = getQueryRunner(requestHeaders.realityId!, this.config);
            const snapshotPageRepository = getSnapshotPageRepository(this.config, queryRunner);
            const snapshotMetadataRepository = getSnapshotMetadataRepository(
                this.config,
                queryRunner,
            );
            const firstRequest = await SnapshotListener.sendQueryRequest(requestContext, context);

            if (!context.snapshotContext) {
                const totalCount = firstRequest.extensions.totalCount;
                if (totalCount != null) {
                    this.fillContextWithSnapshotMetadata(
                        context,
                        totalCount,
                        requestHeaders,
                        firstRequest,
                    );
                } else {
                    return;
                }
            }

            const pageCount = Math.ceil(
                context.snapshotContext!.totalCount! / context.snapshotContext!.countPerPage!,
            );
            const snapshotPages: SnapshotPage[] = Array(pageCount)
                .fill(0)
                .map(this.generateUUIDAndCreateSnapshotPage);
            const pagesIds = snapshotPages.map((snapPage: SnapshotPage) => snapPage.id);
            await saveSnapshotPages(snapshotPages, this.config, snapshotPageRepository);
            const irrelevantEntitiesOfPages: IrrelevantEntitiesResponse[] = [];
            const snapshotMetadata = new SnapshotMetadata();
            snapshotMetadata.pagesIds = pagesIds;
            snapshotMetadata.dataVersion = context.returnedExtensions.globalDataVersion;
            snapshotMetadata.totalCount = context.snapshotContext?.totalCount!;
            snapshotMetadata.pagesCount = pageCount;
            await saveSnapshotMetadata(snapshotMetadata, this.config, snapshotMetadataRepository);
            this.executeSnapshotByConnectionlessConfiguration(
                requestContext,
                firstRequest,
                snapshotMetadata,
                snapshotPages,
                irrelevantEntitiesOfPages,
                pageCount,
                queryRunner,
                snapshotPageRepository,
                snapshotMetadataRepository,
            );
            requestContext.context.returnedExtensions.snapResponse = {
                snapshotMetadataId: snapshotMetadata.id,
                pagesIds,
            };
        })();
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
                data: {},
            };
        }

        return null;
    }

    private generateUUIDAndCreateSnapshotPage(): SnapshotPage {
        const uuid = uuidv4();
        return new SnapshotPage(uuid);
    }

    private async saveResultToSnapshot(
        parsedResult: any,
        snapshotPage: SnapshotPage,
        snapshotPageRepository?: Repository<SnapshotPage>,
    ): Promise<void> {
        snapshotPage.setData(JSON.stringify(parsedResult));
        await updateSnapshotPage(
            snapshotPage.id,
            this.config,
            {
                status: SnapshotStatus.DONE,
                data: snapshotPage.data,
            },
            snapshotPageRepository,
        );
    }

    private async wrapConnectionlessSnapshotExecutionWithTransaction(
        logger: PolarisGraphQLLogger,
        context: PolarisGraphQLContext,
        firstRequest: any,
        snapshotMetadata: SnapshotMetadata,
        snapshotPages: SnapshotPage[],
        irrelevantEntitiesOfPages: IrrelevantEntitiesResponse[],
        pageCount: number,
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
    ) {
        const client = await this.config.connectionLessConfiguration?.startTransaction();
        try {
            await this.executeSnapshotPagination(
                context,
                firstRequest,
                snapshotMetadata,
                snapshotPages,
                irrelevantEntitiesOfPages,
                pageCount,
                requestContext,
            );
            this.config.connectionLessConfiguration?.commitTransaction(client);
        } catch (e) {
            this.config.connectionLessConfiguration?.rollbackTransaction(client);
            await this.failSnapshotMetadata(snapshotMetadata, e);
            logger.error('Error in snapshot process', context, {
                throwable: e,
            });
            throw e;
        }
    }

    private async wrapSnapshotExecutionWithTransaction(
        queryRunner: QueryRunner,
        logger: PolarisGraphQLLogger,
        context: PolarisGraphQLContext,
        firstRequest: any,
        snapshotMetadata: SnapshotMetadata,
        snapshotPages: SnapshotPage[],
        irrelevantEntitiesOfPages: IrrelevantEntitiesResponse[],
        pageCount: number,
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
        queryRunnerToRelease?: QueryRunner,
        snapshotPageRepository?: Repository<SnapshotPage>,
        snapshotMetadataRepository?: Repository<SnapshotMetadata>,
    ) {
        let transactionStarted = false;
        try {
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction('SERIALIZABLE');
                await queryRunner.query('SET TRANSACTION READ ONLY');
                transactionStarted = true;
            }
            await this.executeSnapshotPagination(
                context,
                firstRequest,
                snapshotMetadata,
                snapshotPages,
                irrelevantEntitiesOfPages,
                pageCount,
                requestContext,
                snapshotPageRepository,
                snapshotMetadataRepository,
                queryRunnerToRelease,
            );
            if (transactionStarted) {
                await queryRunner.commitTransaction();
            }
        } catch (e) {
            if (transactionStarted) {
                await queryRunner.rollbackTransaction();
            }
            await this.failSnapshotMetadata(snapshotMetadata, e, snapshotMetadataRepository);
            logger.error('Error in snapshot process', context, {
                throwable: e,
            });
            throw e;
        } finally {
            if (!queryRunner.isReleased) {
                await queryRunner.release();
            }
        }
    }

    private async executeSnapshotPagination(
        context: PolarisGraphQLContext,
        firstRequest: any,
        snapshotMetadata: SnapshotMetadata,
        snapshotPages: SnapshotPage[],
        irrelevantEntitiesOfPages: IrrelevantEntitiesResponse[],
        pageCount: number,
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
        snapshotPageRepository?: Repository<SnapshotPage>,
        snapshotMetadataRepository?: Repository<SnapshotMetadata>,
        queryRunnerToRelease?: QueryRunner,
    ) {
        let currentPageIndex: number = 0;
        await this.handleSnapshotOperation(
            context,
            firstRequest,
            snapshotMetadata,
            snapshotPages[currentPageIndex],
            irrelevantEntitiesOfPages,
            snapshotPageRepository,
            snapshotMetadataRepository,
        );
        context.snapshotContext!.startIndex! += context.snapshotContext!.countPerPage!;
        ++currentPageIndex;
        while (currentPageIndex < pageCount) {
            const parsedResult = await SnapshotListener.sendQueryRequest(requestContext, context);
            await this.handleSnapshotOperation(
                context,
                parsedResult,
                snapshotMetadata,
                snapshotPages[currentPageIndex],
                irrelevantEntitiesOfPages,
                snapshotPageRepository,
                snapshotMetadataRepository,
            );
            context.snapshotContext!.startIndex! += context.snapshotContext!.countPerPage!;
            currentPageIndex++;
        }
        const mergedIrrelevantEntities:
            | IrrelevantEntitiesResponse
            | undefined = mergeIrrelevantEntities(irrelevantEntitiesOfPages);
        await this.completeSnapshotMetadataFields(
            snapshotMetadata,
            mergedIrrelevantEntities,
            snapshotMetadataRepository,
        );
        releaseQueryRunner(queryRunnerToRelease);
    }

    private async handleSnapshotOperation(
        context: PolarisGraphQLContext,
        parsedResult: any,
        snapshotMetadata: SnapshotMetadata,
        snapshotPage: SnapshotPage,
        irrelevantEntities: IrrelevantEntitiesResponse[],
        snapshotPageRepository?: Repository<SnapshotPage>,
        snapshotMetadataRepository?: Repository<SnapshotMetadata>,
    ) {
        context.snapshotContext!.prefetchBuffer = parsedResult.extensions.prefetchBuffer;
        delete parsedResult.extensions.prefetchBuffer;
        if (parsedResult.extensions.irrelevantEntities) {
            irrelevantEntities.push(parsedResult.extensions.irrelevantEntities);
            delete parsedResult.extensions.irrelevantEntities;
        }
        snapshotMetadata.addWarnings(parsedResult.extensions.warnings);
        snapshotMetadata.addErrors(parsedResult.extensions.errors);
        await this.saveResultToSnapshot(parsedResult, snapshotPage, snapshotPageRepository);

        await updateSnapshotMetadata(
            snapshotMetadata.id,
            this.config,
            {
                warnings: snapshotMetadata.warnings,
                errors: snapshotMetadata.errors,
                currentPageIndex: snapshotMetadata.currentPageIndex + 1,
            },
            snapshotMetadataRepository,
        );
    }

    private async failSnapshotMetadata(
        snapshotMetadata: SnapshotMetadata,
        error: Error,
        snapshotMetadataRepository?: Repository<SnapshotMetadata>,
    ) {
        snapshotMetadata.addErrors(error.message);
        await updateSnapshotMetadata(
            snapshotMetadata.id,
            this.config,
            {
                status: SnapshotStatus.FAILED,
                pagesIds: [],
                errors: snapshotMetadata.errors,
            },
            snapshotMetadataRepository,
        );
    }

    private async completeSnapshotMetadataFields(
        snapshotMetadata: SnapshotMetadata,
        mergedIrrelevantEntities: IrrelevantEntitiesResponse | undefined,
        snapshotMetadataRepository?: Repository<SnapshotMetadata>,
    ) {
        await updateSnapshotMetadata(
            snapshotMetadata.id,
            this.config,
            {
                irrelevantEntities: JSON.stringify(mergedIrrelevantEntities),
                currentPageIndex: null as any,
                status: SnapshotStatus.DONE,
            },
            snapshotMetadataRepository,
        );
    }

    private fillContextWithSnapshotMetadata(
        context: PolarisGraphQLContext,
        totalCount: number,
        requestHeaders: PolarisRequestHeaders,
        parsedResult: any,
    ) {
        context.snapshotContext = {
            totalCount,
            startIndex: 0,
            countPerPage: requestHeaders.snapPageSize
                ? Math.min(this.config.snapshotConfig.maxPageSize, requestHeaders.snapPageSize)
                : this.config.snapshotConfig.maxPageSize,
        };
        context.returnedExtensions.globalDataVersion = parsedResult.extensions.globalDataVersion;
    }

    private getQueryRunner(context: PolarisGraphQLContext): QueryRunner {
        const connection = getConnectionForReality(
            SnapshotListener.getRealityFromHeaders(context),
            this.config.supportedRealities,
            this.config.connectionManager as PolarisConnectionManager,
        );
        const requestId = context.requestHeaders.requestId;
        if (requestId && connection.queryRunners.get(requestId)) {
            return connection.queryRunners.get(requestId)!;
        } else {
            const qr = connection.createQueryRunner();
            connection.addQueryRunner(requestId!, qr);
            return qr;
        }
    }

    private executeSnapshotByConnectionlessConfiguration(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
        firstRequest: any,
        snapshotMetadata: SnapshotMetadata,
        snapshotPages: SnapshotPage[],
        irrelevantEntitiesOfPages: IrrelevantEntitiesResponse[],
        pageCount: number,
        queryRunner?: QueryRunner,
        snapshotPageRepository?: Repository<SnapshotPage>,
        snapshotMetadataRepository?: Repository<SnapshotMetadata>,
    ) {
        if (this.config.connectionLessConfiguration) {
            releaseQueryRunner(queryRunner);
            this.wrapConnectionlessSnapshotExecutionWithTransaction(
                this.config.logger,
                requestContext.context,
                firstRequest,
                snapshotMetadata,
                snapshotPages,
                irrelevantEntitiesOfPages,
                pageCount,
                requestContext,
            );
        } else {
            this.wrapSnapshotExecutionWithTransaction(
                this.getQueryRunner(requestContext.context),
                this.config.logger,
                requestContext.context,
                firstRequest,
                snapshotMetadata,
                snapshotPages,
                irrelevantEntitiesOfPages,
                pageCount,
                requestContext,
                queryRunner,
                snapshotPageRepository,
                snapshotMetadataRepository,
            );
        }
    }
}
