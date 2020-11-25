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
    getSnapshotMetadataById,
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
                    const connection = getConnectionForReality(
                        context.requestHeaders.realityId!,
                        this.config.supportedRealities as any,
                        this.config.connectionManager as PolarisConnectionManager,
                    );
                    const snapshotMetadata = await saveSnapshotMetadata(
                        this.config,
                        context,
                        connection,
                    );
                    if (snapshotMetadata) {
                        this.executeSnapshot(requestContext, snapshotMetadata, connection as any);
                        requestContext.context.returnedExtensions.snapResponse = {
                            snapshotMetadataId: snapshotMetadata.id,
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
                data: [],
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
        snapshotMetadata: SnapshotMetadata,
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
            await this.executeSnapshotPagination(snapshotMetadata, requestContext);
            this.config.connectionlessConfiguration?.commitTransaction(client);
        } catch (e) {
            this.config.connectionlessConfiguration?.rollbackTransaction(client);
            await this.failSnapshotMetadata(
                snapshotMetadata.id,
                requestContext?.context?.requestHeaders?.realityId || 0,
                e,
            );
            logger.error('Error in snapshot process', context, {
                throwable: e,
            });
            throw e;
        }
    }
    private async wrapSnapshotExecutionWithTransaction(
        queryRunner: QueryRunner,
        logger: PolarisGraphQLLogger,
        snapshotMetadata: SnapshotMetadata,
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
                transactionStarted = true;
            }
            await this.executeSnapshotPagination(
                snapshotMetadata,
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
            await this.failSnapshotMetadata(
                snapshotMetadata.id,
                requestContext?.context?.requestHeaders?.realityId || 0,
                connection,
            );
            logger.error('Error in snapshot process', requestContext.context, {
                throwable: e,
            });
        } finally {
            if (!queryRunner.isReleased) {
                await queryRunner.release();
            }
        }
    }

    private async executeSnapshotPagination(
        snapshotMetadata: SnapshotMetadata,
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
        let { context } = requestContext;
        context = { ...context, snapshotContext: { startIndex: 0 } };
        let parsedResult = await SnapshotListener.sendQueryRequest(requestContext, context);
        this.fillContextWithSnapshotMetadata(
            context,
            parsedResult.extensions.totalCount,
            parsedResult.extensions.dataVersion,
        );
        const pageCount = Math.ceil(
            context.snapshotContext!.totalCount! / context.snapshotContext!.pageSize!,
        );
        const irrelevantEntities: IrrelevantEntitiesResponse[] = [];
        const snapshotPages: SnapshotPage[] = Array(pageCount)
            .fill(0)
            .map(this.generateUUIDAndCreateSnapshotPage);
        const pagesIds = snapshotPages.map((snapPage: SnapshotPage) => snapPage.id);
        await saveSnapshotPages(snapshotPages, this.config, connection);
        await this.handleSnapshotOperation(
            context,
            parsedResult,
            snapshotMetadata,
            snapshotPages[0],
            irrelevantEntities,
            queryRunner,
            connection,
        );
        context.snapshotContext!.startIndex! += context.snapshotContext!.pageSize!;
        await updateSnapshotMetadata(
            snapshotMetadata.id,
            this.config,
            {
                pagesIds,
                totalCount: parsedResult.extensions.totalCount,
                dataVersion: parsedResult.extensions.dataVersion,
                pagesCount: pageCount,
                currentPageIndex: 1,
            },
            connection,
        );

        let currentPageIndex: number = 1;
        while (currentPageIndex < pageCount) {
            parsedResult = await SnapshotListener.sendQueryRequest(requestContext, context);
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
        const mergedIrrelevantEntities:
            | IrrelevantEntitiesResponse
            | undefined = mergeIrrelevantEntities(irrelevantEntities);
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
                    dataVersion: parsedResult.extensions.dataVersion,
                    warnings: snapshotMetadata.warnings,
                    errors: snapshotMetadata.errors,
                    currentPageIndex: snapshotMetadata.currentPageIndex + 1,
                },
                connection,
            );
            if (snapshotMetadata.errors) {
                throw new Error('errors in snapshot process');
            }
        }
    }

    private async failSnapshotMetadata(
        snapshotMetadataId: string,
        realityId: number,
        connection?: PolarisConnection,
    ) {
        const snapshotMetadata = await getSnapshotMetadataById(
            snapshotMetadataId,
            realityId,
            this.config,
            connection!,
        );
        if (snapshotMetadata) {
            for (const id of snapshotMetadata.pagesIds) {
                await updateSnapshotPage(
                    id,
                    this.config,
                    {
                        id,
                        status: SnapshotStatus.FAILED,
                        data: undefined,
                    },
                    connection,
                );
            }
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
            if (mergedIrrelevantEntities) {
                snapshotMetadata.addIrrelevantEntities(mergedIrrelevantEntities);
            }
            await updateSnapshotMetadata(
                snapshotMetadata.id,
                this.config,
                {
                    irrelevantEntities: snapshotMetadata.irrelevantEntities,
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
            ...context.snapshotContext,
            totalCount,
            pageSize: calculatePageSize(
                this.config.snapshotConfig.maxPageSize,
                context?.requestHeaders?.snapPageSize,
            ),
        };
        context.returnedExtensions.dataVersion = dataVersion;
    }

    private async getQueryRunner(context: PolarisGraphQLContext): Promise<QueryRunner> {
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
            await qr.startTransaction('SERIALIZABLE');
            await qr.query('SET TRANSACTION READ ONLY');
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
        snapshotMetadata: SnapshotMetadata,
        connection: PolarisConnection,
    ) {
        if (this.config.connectionlessConfiguration) {
            await this.wrapConnectionlessSnapshotExecutionWithTransaction(
                this.config.logger,
                requestContext.context,
                snapshotMetadata,
                requestContext,
            );
        } else {
            await this.wrapSnapshotExecutionWithTransaction(
                await this.getQueryRunner(requestContext.context),
                this.config.logger,
                snapshotMetadata,
                requestContext,
                connection,
            );
        }
    }
}
