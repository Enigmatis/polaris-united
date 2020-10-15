import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    getConnectionForReality,
    PolarisConnection,
    PolarisConnectionManager,
} from '@enigmatis/polaris-typeorm';
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

    private static async queryIrrelevant(
        connection: PolarisConnection,
        typeName: string,
        context: PolarisGraphQLContext,
        result: any,
    ) {
        let irrelevantQuery = await connection
            .getRepository(typeName)
            .createQueryBuilder(context, 'x')
            .select('id')
            .where('x.realityId = :realityId', { realityId: context.requestHeaders.realityId })
            .andWhere('x.dataVersion > :dataVersion', {
                dataVersion: context.requestHeaders.dataVersion,
            });

        if (result.length > 0) {
            irrelevantQuery = irrelevantQuery.andWhere('NOT (x.id IN (:...ids))', {
                ids: result.map((x: any) => x.id),
            });
        }
        return irrelevantQuery.getRawMany();
    }

    public readonly connectionManager?: PolarisConnectionManager;
    public readonly realitiesHolder: RealitiesHolder;
    public readonly logger: PolarisGraphQLLogger;

    constructor(
        logger: PolarisGraphQLLogger,
        realitiesHolder: RealitiesHolder,
        connectionManager?: PolarisConnectionManager,
    ) {
        this.connectionManager = connectionManager;
        this.logger = logger;
        this.realitiesHolder = realitiesHolder;
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
                const connection = getConnectionForReality(
                    context.requestHeaders.realityId,
                    this.realitiesHolder,
                    this.connectionManager,
                );

                const typeName = getTypeName(info);
                if (connection.hasRepository(typeName)) {
                    const resultIrrelevant = await IrrelevantEntitiesMiddleware.queryIrrelevant(
                        connection,
                        typeName,
                        context,
                        result,
                    );

                    if (resultIrrelevant && resultIrrelevant.length > 0) {
                        IrrelevantEntitiesMiddleware.appendIrrelevantEntitiesToExtensions(
                            info,
                            resultIrrelevant,
                            context,
                        );
                    }
                } else {
                    this.logger.warn(
                        'Could not find repository with the graphql object name',
                        context,
                    );
                }
            }

            this.logger.debug('Irrelevant entities middleware finished job', context);
            return result;
        };
    }
}
