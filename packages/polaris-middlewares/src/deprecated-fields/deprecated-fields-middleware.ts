import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { GraphQLResolveInfo } from 'graphql';

export class DeprecatedFieldsMiddleware {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: any,
            context: PolarisGraphQLContext,
            info: GraphQLResolveInfo,
        ) => {
            this.logger.debug('Deprecated fields middleware started job', context);
            const fieldName = info.fieldName;
            if (info.parentType.getFields()[fieldName].isDeprecated) {
                context.requestedDeprecatedFields.push(fieldName);
            }
            const result = await resolve(root, args, context, info);
            this.logger.debug('Deprecated fields middleware finished job', context);
            return result;
        };
    }
}
