import {PolarisGraphQLContext, RealitiesHolder} from '@enigmatis/polaris-common';
import {PolarisGraphQLLogger} from '@enigmatis/polaris-graphql-logger';
import {DataVersion, getConnectionForReality, PolarisConnectionManager,} from '@enigmatis/polaris-typeorm';
import {ConnectionlessConfiguration} from '..';

export class DataVersionMiddleware {
    public readonly connectionManager?: PolarisConnectionManager;
    public readonly realitiesHolder: RealitiesHolder;
    public readonly logger: PolarisGraphQLLogger;
    public readonly connectionLessConfiguration?: ConnectionlessConfiguration;

    constructor(
        logger: PolarisGraphQLLogger,
        realitiesHolder: RealitiesHolder,
        connectionManager?: PolarisConnectionManager,
        connectionLessConfiguration?: ConnectionlessConfiguration,
    ) {
        this.connectionManager = connectionManager;
        this.realitiesHolder = realitiesHolder;
        this.logger = logger;
        this.connectionLessConfiguration = connectionLessConfiguration;
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
            context = context || {};
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
        const globalDataVersion = await this.getDataVersion(context);
        if (globalDataVersion) {
            context.returnedExtensions = {
                ...context.returnedExtensions,
                globalDataVersion: globalDataVersion.getValue(),
            };
        }
    }

    private async getDataVersion(context: PolarisGraphQLContext): Promise<DataVersion | undefined> {
        let globalDataVersion: any;
        if (this.connectionLessConfiguration) {
            globalDataVersion = await this.connectionLessConfiguration.getDataVersion();
        } else {
            if (context?.requestHeaders?.realityId == null || !this.connectionManager?.connections?.length
            ) {
                return;
            }
            const connection = getConnectionForReality(
                context.requestHeaders.realityId,
                this.realitiesHolder,
                this.connectionManager,
            );
            const dataVersionRepo = connection.getRepository(DataVersion);
            globalDataVersion = await dataVersionRepo.findOne(context);
        }

        if (!globalDataVersion) {
            throw new Error('no data version found in db');
        }

        return globalDataVersion;
    }
}
