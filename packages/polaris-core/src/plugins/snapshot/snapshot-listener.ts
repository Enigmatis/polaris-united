import {
    IrrelevantEntitiesResponse,
    mergeIrrelevantEntities,
    PolarisGraphQLContext,
    PolarisRequestHeaders,
    RealitiesHolder,
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
import { SnapshotConfiguration } from '../..';

export class SnapshotListener implements GraphQLRequestListener<PolarisGraphQLContext> {
    public static graphQLOptions: any;

    private static getRealityFromHeaders(context: PolarisGraphQLContext): number {
        return context.requestHeaders.realityId !== undefined
            ? context.requestHeaders.realityId
            : 0;
    }

    private static async completeSnapshotMetadataFields(
        snapshotMetadata: SnapshotMetadata,
        mergedIrrelevantEntities: IrrelevantEntitiesResponse | undefined,
        snapshotMetadataRepository: Repository<SnapshotMetadata>,
    ) {
        await snapshotMetadataRepository.update(snapshotMetadata.id, {
            irrelevantEntities: JSON.stringify(mergedIrrelevantEntities),
            currentPageIndex: null as any,
            status: SnapshotStatus.DONE,
        });
    }

    private static generateUUIDAndCreateSnapshotPage(): SnapshotPage {
        const uuid = uuidv4();
        return new SnapshotPage(uuid);
    }

    private static async saveResultToSnapshot(
        parsedResult: any,
        snapshotRepository: Repository<SnapshotPage>,
        snapshotPage: SnapshotPage,
    ): Promise<void> {
        snapshotPage.setData(JSON.stringify(parsedResult));
        await snapshotRepository.update(snapshotPage.id, {
            status: SnapshotStatus.DONE,
            data: snapshotPage.data,
        });
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
    private static async wrapExecuteSnapshotWithTransaction(
        queryRunner: QueryRunner,
        logger: PolarisGraphQLLogger,
        context: PolarisGraphQLContext,
        snapshotMetadata: SnapshotMetadata,
        snapshotRepository: Repository<SnapshotPage>,
        snapshotMetadataRepository: Repository<SnapshotMetadata>,
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
        let transactionStarted = false;
        try {
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction('SERIALIZABLE');
                await queryRunner.query('SET TRANSACTION READ ONLY');
                transactionStarted = true;
            }
            await SnapshotListener.executeSnapshotPagination(
                context,
                snapshotRepository,
                snapshotMetadataRepository,
                snapshotMetadata,
                snapshotPages,
                irrelevantEntitiesOfPages,
                pageCount,
                requestContext,
            );
            if (transactionStarted) {
                await queryRunner.commitTransaction();
            }
        } catch (e) {
            if (transactionStarted) {
                await queryRunner.rollbackTransaction();
            }
            await SnapshotListener.failSnapshotMetadata(
                snapshotMetadataRepository,
                snapshotMetadata,
                e,
            );
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
    private static async executeSnapshotPagination(
        context: PolarisGraphQLContext,
        snapshotRepository: Repository<SnapshotPage>,
        snapshotMetadataRepository: Repository<SnapshotMetadata>,
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
        let currentPageIndex: number = 0;
        while (currentPageIndex < pageCount) {
            const parsedResult = await SnapshotListener.sendQueryRequest(requestContext, context);
            await SnapshotListener.handleSnapshotOperation(
                context,
                parsedResult,
                snapshotRepository,
                snapshotMetadataRepository,
                snapshotMetadata,
                snapshotPages[currentPageIndex],
                irrelevantEntitiesOfPages,
            );
            context.snapshotContext!.startIndex! += context.snapshotContext!.countPerPage!;
            currentPageIndex++;
        }
        const mergedIrrelevantEntities:
            | IrrelevantEntitiesResponse
            | undefined = mergeIrrelevantEntities(irrelevantEntitiesOfPages);
        await SnapshotListener.completeSnapshotMetadataFields(
            snapshotMetadata,
            mergedIrrelevantEntities,
            snapshotMetadataRepository,
        );
    }

    private static async handleSnapshotOperation(
        context: PolarisGraphQLContext,
        parsedResult: any,
        snapshotRepository: Repository<SnapshotPage>,
        snapshotMetadataRepository: Repository<SnapshotMetadata>,
        snapshotMetadata: SnapshotMetadata,
        snapshotPage: SnapshotPage,
        irrelevantEntities: IrrelevantEntitiesResponse[],
    ) {
        context.snapshotContext!.prefetchBuffer = parsedResult.extensions.prefetchBuffer;
        delete parsedResult.extensions.prefetchBuffer;
        if (parsedResult.extensions.irrelevantEntities) {
            irrelevantEntities.push(parsedResult.extensions.irrelevantEntities);
            delete parsedResult.extensions.irrelevantEntities;
        }
        snapshotMetadata.addWarnings(parsedResult.extensions.warnings);
        snapshotMetadata.addErrors(parsedResult.extensions.errors);
        await SnapshotListener.saveResultToSnapshot(parsedResult, snapshotRepository, snapshotPage);
        await snapshotMetadataRepository.update(snapshotMetadata.id, {
            warnings: snapshotMetadata.warnings,
            errors: snapshotMetadata.errors,
            currentPageIndex: snapshotMetadata.currentPageIndex + 1,
        });
    }

    private static async failSnapshotMetadata(
        snapshotMetadataRepository: Repository<SnapshotMetadata>,
        snapshotMetadata: SnapshotMetadata,
        error: Error,
    ) {
        snapshotMetadata.addErrors(error.message);
        await snapshotMetadataRepository.update(snapshotMetadata.id, {
            status: SnapshotStatus.FAILED,
            pagesIds: [],
            errors: snapshotMetadata.errors,
        });
    }

    public constructor(
        private readonly logger: PolarisGraphQLLogger,
        private readonly realitiesHolder: RealitiesHolder,
        private readonly snapshotConfiguration: SnapshotConfiguration,
        private readonly connectionManager: PolarisConnectionManager,
    ) {}

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
            (!context.requestHeaders.snapRequest && !this.snapshotConfiguration.autoSnapshot) ||
            isMutation(requestContext.request.query)
        ) {
            return;
        }

        return (async (): Promise<void> => {
            const { requestHeaders } = context;
            const connection = getConnectionForReality(
                requestHeaders.realityId!,
                this.realitiesHolder as any,
                this.connectionManager,
            );
            const snapshotManager = connection.createQueryRunner().manager;
            const snapshotRepository = snapshotManager.getRepository(SnapshotPage);
            const snapshotMetadataRepository = snapshotManager.getRepository(SnapshotMetadata);
            const snapshotMetadata = new SnapshotMetadata();
            await snapshotMetadataRepository.save(snapshotMetadata);
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
                .map(SnapshotListener.generateUUIDAndCreateSnapshotPage);
            const pagesIds = snapshotPages.map((snapPage: SnapshotPage) => snapPage.id);
            await snapshotRepository.save(snapshotPages);
            const irrelevantEntitiesOfPages: IrrelevantEntitiesResponse[] = [];
            snapshotMetadata.pagesIds = pagesIds;
            snapshotMetadata.dataVersion = context.returnedExtensions.globalDataVersion;
            snapshotMetadata.totalCount = context.snapshotContext?.totalCount!;
            snapshotMetadata.pagesCount = pageCount;
            await snapshotMetadataRepository.save(snapshotMetadata);
            SnapshotListener.wrapExecuteSnapshotWithTransaction(
                this.getQueryRunner(requestContext.context),
                this.logger,
                requestContext.context,
                snapshotMetadata,
                snapshotRepository,
                snapshotMetadataRepository,
                snapshotPages,
                irrelevantEntitiesOfPages,
                pageCount,
                requestContext,
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
                ? Math.min(this.snapshotConfiguration.maxPageSize, requestHeaders.snapPageSize)
                : this.snapshotConfiguration.maxPageSize,
        };
        context.returnedExtensions.globalDataVersion = parsedResult.extensions.globalDataVersion;
    }

    private getQueryRunner(context: PolarisGraphQLContext): QueryRunner {
        const connection = getConnectionForReality(
            SnapshotListener.getRealityFromHeaders(context),
            this.realitiesHolder,
            this.connectionManager,
        );
        const requestId = context.requestHeaders.requestId;
        if (requestId && connection.queryRunners.get(requestId)) {
            return connection.queryRunners.get(requestId)!;
        } else {
            const qr = connection.createQueryRunner();
            Object.assign(qr, { name: requestId! });
            connection.addQueryRunner(requestId!, qr);
            return qr;
        }
    }
}
