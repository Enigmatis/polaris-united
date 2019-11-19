import { DATA_VERSION, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { DataVersion, Connection } from '@enigmatis/polaris-typeorm';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';

export class DataVersionMiddleware {
    readonly connection?: Connection;
    readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger, connection?: Connection) {
        this.connection = connection;
        this.logger = logger;
    }

    getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: any,
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Data version middleware started job', { context });
            const result = await resolve(root, args, context, info);
            let finalResult = result;
            if (
                !root &&
                context &&
                context.requestHeaders &&
                context.requestHeaders.dataVersion &&
                !isNaN(context.requestHeaders.dataVersion)
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
            await this.updateDataVersionInReturnedExtensions(context);
            this.logger.debug('Data version middleware finished job', { context });
            return finalResult;
        };
    }

    async updateDataVersionInReturnedExtensions(context: PolarisGraphQLContext) {
        if(!this.connection) return;
        const dataVersionRepo = this.connection.getRepository(DataVersion);
        const globalDataVersion: any = await dataVersionRepo.findOne();
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
// is it relevant?
export const initContextForDataVersion = async ({ req }: any) => {
    return {
        dataVersion: req.headers[DATA_VERSION],
    };
};
