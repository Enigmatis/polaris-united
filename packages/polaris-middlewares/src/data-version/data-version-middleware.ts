import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { DataVersion, getConnectionForReality, PolarisConnectionManager } from '@enigmatis/polaris-typeorm';

export class DataVersionMiddleware {
    public readonly connectionManager?: PolarisConnectionManager;
    public readonly realitiesHolder: RealitiesHolder;
    public readonly logger: PolarisGraphQLLogger;

    constructor(
        logger: PolarisGraphQLLogger,
        realitiesHolder: RealitiesHolder,
        connectionManager?: PolarisConnectionManager,
    ) {
        this.connectionManager = connectionManager;
        this.realitiesHolder = realitiesHolder;
        this.logger = logger;
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: any,
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Data version middleware started job', context);
            const result = await resolve(root, args, context, info);
            let finalResult = result;
            if (
                !root &&
                context.requestHeaders &&
                context.requestHeaders.dataVersion &&
                !isNaN(context.requestHeaders.dataVersion) &&
                result !== undefined &&
                result !== null
            ) {
                if (Array.isArray(result)) {
                    finalResult = result.filter(entity =>
                        entity.dataVersion && context.requestHeaders.dataVersion
                            ? entity.dataVersion > context.requestHeaders.dataVersion
                            : entity,
                    );
                } else if (
                    !(
                        (result.dataVersion &&
                            context.requestHeaders.dataVersion &&
                            result.dataVersion > context.requestHeaders.dataVersion) ||
                        !result.dataVersion
                    )
                ) {
                    finalResult = undefined;
                }
            }
            if ((context.returnedExtensions?.globalDataVersion) === undefined) {
                await this.updateDataVersionInReturnedExtensions(context);
            }
            this.logger.debug('Data version middleware finished job', context);
            return finalResult;
        };
    }

    public async updateDataVersionInReturnedExtensions(context: PolarisGraphQLContext) {
        if (context?.requestHeaders?.realityId == null || !this.connectionManager?.connections?.length
        ) {
            return;
        }
        const connection = getConnectionForReality(
            context.requestHeaders.realityId,
            this.realitiesHolder,
            this.connectionManager
        );
        const dataVersionRepo = connection.getRepository(DataVersion);
        const globalDataVersion: any = await dataVersionRepo.findOne(context);
        if (globalDataVersion) {
            context.returnedExtensions = {
                ...context.returnedExtensions,
                globalDataVersion: globalDataVersion.getValue(),
            };
        } else {
            throw new Error('no data version found in db');
        }
    }
}
