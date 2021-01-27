import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    getConnectionForReality,
    PolarisConnection,
    PolarisConnectionManager,
} from '@enigmatis/polaris-typeorm';
import { ConnectionlessConfiguration, ConnectionlessIrrelevantEntitiesCriteria } from '..';
import { getTypeName } from '../utills/return-type';

export class IrrelevantEntitiesMiddleware {
    private static appendIrrelevantEntitiesToExtensions(
        info: any,
        resultIrrelevant: any,
        context: PolarisGraphQLContext,
    ) {
        const irrelevantEntities: any = {};
        irrelevantEntities[info.path.key] = resultIrrelevant.map((x: any) => x.id);
        if (!context.returnedExtensions) {
            context.returnedExtensions = {} as any;
        }
        context.returnedExtensions = {
            ...context.returnedExtensions,
            irrelevantEntities: {
                ...context.returnedExtensions.irrelevantEntities,
                ...irrelevantEntities,
            },
        } as any;
    }

    public readonly connectionLessConfiguration?: ConnectionlessConfiguration;
    public readonly connectionManager?: PolarisConnectionManager;
    public readonly realitiesHolder: RealitiesHolder;
    public readonly logger: PolarisGraphQLLogger;

    constructor(
        logger: PolarisGraphQLLogger,
        realitiesHolder: RealitiesHolder,
        connectionManager?: PolarisConnectionManager,
        connectionLessConfiguration?: ConnectionlessConfiguration,
    ) {
        this.connectionManager = connectionManager;
        this.logger = logger;
        this.realitiesHolder = realitiesHolder;
        this.connectionLessConfiguration = connectionLessConfiguration;
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: { [argName: string]: any },
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Irrelevant entities middleware started job', context);
            const result = await resolve(root, args, context, info);

            if (
                context?.requestHeaders?.dataVersion != null &&
                context?.requestHeaders?.dataVersion !== 0 &&
                context?.requestHeaders?.realityId != null &&
                !isNaN(context?.requestHeaders?.dataVersion) &&
                info.returnType.ofType &&
                this.connectionManager?.connections?.length &&
                !root
            ) {
                const typeName = getTypeName(info);
                const resultIrrelevant = await this.queryIrrelevant(typeName, context, result);
                if (resultIrrelevant && resultIrrelevant.length > 0) {
                    IrrelevantEntitiesMiddleware.appendIrrelevantEntitiesToExtensions(
                        info,
                        resultIrrelevant,
                        context,
                    );
                }
            }

            this.logger.debug('Irrelevant entities middleware finished job', context);
            return result;
        };
    }

    private async queryIrrelevant(typeName: string, context: PolarisGraphQLContext, result: any) {
        const lastDataVersion = context.onlinePaginatedContext?.lastDataVersionInPage;
        const isLastPage = context.onlinePaginatedContext?.isLastPage;
        const resultIds = result.map((x: any) => x.id);
        if (this.connectionLessConfiguration) {
            const irrelevantWhereCriteria: ConnectionlessIrrelevantEntitiesCriteria = {
                realityId: context.requestHeaders.realityId || 0,
                notInIds: Array.isArray(result) && result.length > 0 ? resultIds : [],
                dataVersionThreshold: context.requestHeaders.dataVersion || 0,
            };
            return this.connectionLessConfiguration.getIrrelevantEntities(
                typeName,
                irrelevantWhereCriteria,
                lastDataVersion,
                isLastPage,
            );
        } else {
            const connection: PolarisConnection = getConnectionForReality(
                context?.requestHeaders?.realityId!,
                this.realitiesHolder,
                this.connectionManager!,
            );
            const tableName = connection.getMetadata(typeName).tableName;
            if (connection.hasRepository(typeName, context)) {
                let irrelevantQuery = await connection
                    .getRepository(tableName, context)
                    .createQueryBuilderWithDeletedEntities(tableName)
                    .select('id');

                if (lastDataVersion && isLastPage === false) {
                    irrelevantQuery = irrelevantQuery.andWhere(
                        `${tableName}.dataVersion < :lastDataVersion`,
                        { lastDataVersion },
                    );
                }

                if (result.length > 0) {
                    irrelevantQuery = irrelevantQuery.andWhere(
                        `NOT (${tableName}.id IN (:...ids))`,
                        {
                            ids: resultIds,
                        },
                    );
                }
                return irrelevantQuery.getRawMany();
            } else {
                this.logger.warn('Could not find repository with the graphql object name', context);
            }
        }
    }
}
