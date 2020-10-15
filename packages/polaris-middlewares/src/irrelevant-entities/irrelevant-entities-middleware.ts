import {PolarisGraphQLContext, RealitiesHolder} from '@enigmatis/polaris-common';
import {PolarisGraphQLLogger} from '@enigmatis/polaris-graphql-logger';
import {getConnectionForReality, In, MoreThan, Not, PolarisConnectionManager,PolarisConnection} from '@enigmatis/polaris-typeorm';
import {ConnectionlessConfiguration, ConnectionlessIrrelevantEntitiesCriteria} from '..';

export class IrrelevantEntitiesMiddleware {
    private static getTypeName(info: any): string {
        let type = info.returnType;
        while (!type.name) {
            type = type.ofType;
        }
        return type.name;
    }

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
                const typeName = IrrelevantEntitiesMiddleware.getTypeName(info);
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
        if (this.connectionLessConfiguration) {
            const irrelevantWhereCriteria: ConnectionlessIrrelevantEntitiesCriteria = {
                realityId: context.requestHeaders.realityId || 0,
                notInIds:
                    Array.isArray(result) && result.length > 0 ? result.map((x: any) => x.id) : [],
                dataVersionThreshold: context.requestHeaders.dataVersion || 0,
            }
            return await this.connectionLessConfiguration.getIrrelevantEntities(
                typeName,
                irrelevantWhereCriteria,
            );
        } else if (
            context?.requestHeaders?.realityId != null &&
            this.connectionManager?.connections?.length
        ) {
            const connection = getConnectionForReality(
                context.requestHeaders.realityId,
                this.realitiesHolder,
                this.connectionManager
            );
            if (connection.hasRepository(typeName)) {
                let irrelevantQuery = await connection.getRepository(typeName).createQueryBuilder("x")
                    .select("id")
                    .where("x.realityId = :realityId", { realityId: context.requestHeaders.realityId })
                    .andWhere("x.dataVersion > :dataVersion", { dataVersion: context.requestHeaders.dataVersion });

                if (result.length > 0) {
                    irrelevantQuery = irrelevantQuery.andWhere("NOT (x.id IN (:...ids))", { ids: result.map((x: any) => x.id) });
                }
                return irrelevantQuery.getRawMany();
            } else {
                this.logger.warn('Could not find repository with the graphql object name', context);
            }
        }
    }
}
