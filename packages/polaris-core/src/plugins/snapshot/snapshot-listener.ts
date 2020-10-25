import {
    IrrelevantEntitiesResponse,
    mergeIrrelevantEntities,
    PolarisGraphQLContext,
} from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { isMutation } from '@enigmatis/polaris-middlewares';
import {
    getConnectionForReality,
    PolarisConnection,
    PolarisConnectionManager,
    QueryRunner,
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
    saveSnapshotMetadata,
    saveSnapshotPages,
    updateSnapshotMetadata,
    updateSnapshotPage,
} from '../../utils/snapshot-connectionless-util';
import { calculatePageSize } from '../../utils/snapshot-util';

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

        if (this.isSnapshotRequest(context, requestContext.request.query)) {
            return (async (): Promise<void> => {
                const firstRequest = await SnapshotListener.sendQueryRequest(
                    requestContext,
                    context,
                );
                const totalCount = firstRequest.extensions.totalCount;
                if (totalCount != null) {
                    this.fillContextWithSnapshotMetadata(
                        context,
                        totalCount,
                        firstRequest.extensions.globalDataVersion,
                    );
                    const pageCount = Math.ceil(
                        context.snapshotContext!.totalCount! / context.snapshotContext!.pageSize!,
                    );
                    const snapshotPages: SnapshotPage[] = Array(pageCount)
                        .fill(0)
                        .map(this.generateUUIDAndCreateSnapshotPage);
                    const pagesIds = snapshotPages.map((snapPage: SnapshotPage) => snapPage.id);
                    const connection = getConnectionForReality(
                        context.requestHeaders.realityId!,
                        this.config.supportedRealities as any,
                        this.config.connectionManager as PolarisConnectionManager,
                    );
                    await saveSnapshotPages(snapshotPages, this.config, connection as any);
                    const snapshotMetadata = await saveSnapshotMetadata(
                        this.config,
                        context,
                        pageCount,
                        pagesIds,
                        connection as any,
                    );
                    this.executeSnapshot(
                        requestContext,
                        snapshotMetadata,
                        snapshotPages,
                        pageCount,
                        connection as any,
                    );
                    if (snapshotMetadata) {
                        requestContext.context.returnedExtensions.snapResponse = {
                            snapshotMetadataId: snapshotMetadata.id,
                            pagesIds,
                        };
                    }
                }
            })();
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
                data: {},
            };
        }

        return null;
    }

    private isSnapshotRequest(context: PolarisGraphQLContext, query?: string) {
        return (
            (context.requestHeaders.snapRequest || this.config.snapshotConfig.autoSnapshot) &&
            !isMutation(query)
        );
    }

    private generateUUIDAndCreateSnapshotPage(): SnapshotPage {
        const uuid = uuidv4();
        return new SnapshotPage(uuid);
    }

    private async saveResultToSnapshot(
        parsedResult: any,
        snapshotPage: SnapshotPage,
        connection?: PolarisConnection,
    ): Promise<void> {
        snapshotPage.setData(JSON.stringify(parsedResult));
        await updateSnapshotPage(
            snapshotPage.id,
            this.config,
            {
                status: SnapshotStatus.DONE,
                data: snapshotPage.data,
            },
            connection,
        );
    }

    private async wrapConnectionlessSnapshotExecutionWithTransaction(
        logger: PolarisGraphQLLogger,
        context: PolarisGraphQLContext,
        snapshotMetadata: SnapshotMetadata | undefined,
        snapshotPages: SnapshotPage[],
        pageCount: number,
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
    ) {
        const client = await this.config.connectionlessConfiguration?.startTransaction();
        context.connectionlessQueryExecutorClient = client;
        try {
            await this.executeSnapshotPagination(
                snapshotMetadata,
                snapshotPages,
                pageCount,
                requestContext,
            );
            this.config.connectionlessConfiguration?.commitTransaction(client);
        } catch (e) {
            this.config.connectionlessConfiguration?.rollbackTransaction(client);
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
        snapshotMetadata: SnapshotMetadata | undefined,
        snapshotPages: SnapshotPage[],
        pageCount: number,
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
        connection: PolarisConnection,
    ) {
        let transactionStarted = false;
        try {
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction('SERIALIZABLE');
                await queryRunner.query('SET TRANSACTION READ ONLY');
                transactionStarted = true;
            }
            await this.executeSnapshotPagination(
                snapshotMetadata,
                snapshotPages,
                pageCount,
                requestContext,
                queryRunner,
                connection,
            );
            if (transactionStarted) {
                await queryRunner.commitTransaction();
            }
        } catch (e) {
            if (transactionStarted) {
                await queryRunner.rollbackTransaction();
            }
            await this.failSnapshotMetadata(snapshotMetadata, e, connection);
            logger.error('Error in snapshot process', requestContext.context, {
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
        snapshotMetadata: SnapshotMetadata | undefined,
        snapshotPages: SnapshotPage[],
        pageCount: number,
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
        queryRunner?: QueryRunner,
        connection?: PolarisConnection,
    ) {
        const { context } = requestContext;
        let currentPageIndex: number = 0;
        const irrelevantEntities: IrrelevantEntitiesResponse[] = [];
        while (currentPageIndex < pageCount) {
            const parsedResult = await SnapshotListener.sendQueryRequest(requestContext, context);
            await this.handleSnapshotOperation(
                context,
                parsedResult,
                snapshotMetadata,
                snapshotPages[currentPageIndex],
                irrelevantEntities,
                queryRunner,
                connection,
            );
            context.snapshotContext!.startIndex! += context.snapshotContext!.pageSize!;
            currentPageIndex++;
        }
        const irrelevantEntitiesOfPages: IrrelevantEntitiesResponse[] = [];
        const mergedIrrelevantEntities:
            | IrrelevantEntitiesResponse
            | undefined = mergeIrrelevantEntities(irrelevantEntitiesOfPages);
        await this.completeSnapshotMetadataFields(
            snapshotMetadata,
            mergedIrrelevantEntities,
            connection,
        );
    }

    private async handleSnapshotOperation(
        context: PolarisGraphQLContext,
        parsedResult: any,
        snapshotMetadata: SnapshotMetadata | undefined,
        snapshotPage: SnapshotPage,
        irrelevantEntities: IrrelevantEntitiesResponse[],
        queryRunner?: QueryRunner,
        connection?: PolarisConnection,
    ) {
        context.snapshotContext!.prefetchBuffer = parsedResult.extensions.prefetchBuffer;
        delete parsedResult.extensions.prefetchBuffer;
        if (parsedResult.extensions.irrelevantEntities) {
            irrelevantEntities.push(parsedResult.extensions.irrelevantEntities);
            delete parsedResult.extensions.irrelevantEntities;
        }
        if (snapshotMetadata) {
            snapshotMetadata.addWarnings(parsedResult.extensions.warnings);
            snapshotMetadata.addErrors(parsedResult.extensions.errors);
            await this.saveResultToSnapshot(parsedResult, snapshotPage, connection);

            await updateSnapshotMetadata(
                snapshotMetadata.id,
                this.config,
                {
                    warnings: snapshotMetadata.warnings,
                    errors: snapshotMetadata.errors,
                    currentPageIndex: snapshotMetadata.currentPageIndex + 1,
                },
                connection,
            );
        }
    }

    private async failSnapshotMetadata(
        snapshotMetadata: SnapshotMetadata | undefined,
        error: Error,
        connection?: PolarisConnection,
    ) {
        if (snapshotMetadata) {
            snapshotMetadata.addErrors(error.message);
            await updateSnapshotMetadata(
                snapshotMetadata.id,
                this.config,
                {
                    status: SnapshotStatus.FAILED,
                    pagesIds: [],
                    errors: snapshotMetadata.errors,
                },
                connection,
            );
        }
    }

    private async completeSnapshotMetadataFields(
        snapshotMetadata: SnapshotMetadata | undefined,
        mergedIrrelevantEntities: IrrelevantEntitiesResponse | undefined,
        connection?: PolarisConnection,
    ) {
        if (snapshotMetadata) {
            await updateSnapshotMetadata(
                snapshotMetadata.id,
                this.config,
                {
                    irrelevantEntities: JSON.stringify(mergedIrrelevantEntities),
                    currentPageIndex: null as any,
                    status: SnapshotStatus.DONE,
                },
                connection,
            );
        }
    }

    private fillContextWithSnapshotMetadata(
        context: PolarisGraphQLContext,
        totalCount: number,
        dataVersion: any,
    ) {
        context.snapshotContext = {
            totalCount,
            startIndex: 0,
            pageSize: calculatePageSize(
                this.config.snapshotConfig.maxPageSize,
                context?.requestHeaders?.snapPageSize,
            ),
        };
        context.returnedExtensions.globalDataVersion = dataVersion;
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

    private async executeSnapshot(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<
                Pick<
                    GraphQLRequestContext<PolarisGraphQLContext>,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
        snapshotMetadata: SnapshotMetadata | undefined,
        snapshotPages: SnapshotPage[],
        pageCount: number,
        connection: PolarisConnection,
    ) {
        if (this.config.connectionlessConfiguration) {
            this.wrapConnectionlessSnapshotExecutionWithTransaction(
                this.config.logger,
                requestContext.context,
                snapshotMetadata,
                snapshotPages,
                pageCount,
                requestContext,
            );
        } else {
            await this.wrapSnapshotExecutionWithTransaction(
                this.getQueryRunner(requestContext.context),
                this.config.logger,
                snapshotMetadata,
                snapshotPages,
                pageCount,
                requestContext,
                connection,
            );
        }
    }
}
