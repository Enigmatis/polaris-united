import { PolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import {
    EntityFilter,
    PolarisGraphQLContext,
    isMutation,
    RealitiesHolder,
} from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { entityFilterInputTypeName } from '@enigmatis/polaris-schema';
import { GraphQLResolveInfo } from 'graphql';

export class DatesFilterMiddleware {
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
            info: GraphQLResolveInfo,
        ) => {
            if (!isMutation(context.request.query)) {
                this.logger.debug('Dates filter middleware started job', context);
                if (this.isCurrentFieldASchemaQuery(info)) {
                    const datesFilterArgumentName = this.getDateFilterArgumentNameIfExists(info);
                    if (datesFilterArgumentName) {
                        context.entityDateRangeFilter = this.getEntityDateRangeFilter(
                            args[datesFilterArgumentName],
                        );
                    } else {
                        delete context.entityDateRangeFilter;
                    }
                }
                const result = await resolve(root, args, context, info);
                this.logger.debug('Dates filter middleware finished job', context);
                return result;
            } else {
                const result = await resolve(root, args, context, info);
                return result;
            }
        };
    }

    private getDateFilterArgumentNameIfExists(info: any): string | undefined {
        let argName;
        const currentQueryArguments = info.schema.getQueryType().getFields()[info.fieldName].args;
        currentQueryArguments.forEach((arg: any) => {
            if (this.isArgNameOfEntityFilterInputType(arg)) {
                argName = arg.name;
            }
        });
        return argName;
    }

    private isArgNameOfEntityFilterInputType(arg: any) {
        return (
            arg.type.name === entityFilterInputTypeName ||
            arg.type.ofType?.name === entityFilterInputTypeName
        );
    }

    private isCurrentFieldASchemaQuery(info: GraphQLResolveInfo): boolean {
        return info.schema.getQueryType()?.getFields()[info.fieldName] !== undefined;
    }

    private getEntityDateRangeFilter(args: any): EntityFilter {
        this.formatDatesToIsoString(args);
        const entityFilter: EntityFilter = { creationTimeFilter: {}, lastUpdateTimeFilter: {} };
        entityFilter.creationTimeFilter = { ...args.creationTime };
        entityFilter.lastUpdateTimeFilter = { ...args.lastUpdateTime };
        return entityFilter;
    }

    private formatDatesToIsoString(args: any) {
        Object.keys(args).forEach((key) => {
            Object.keys(args[key]).forEach((val) => {
                if (val) {
                    args[key][val] = new Date(args[key][val]).toISOString();
                }
            });
        });
    }
}
