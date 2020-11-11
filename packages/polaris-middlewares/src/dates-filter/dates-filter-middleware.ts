import {PolarisConnectionManager} from "@enigmatis/polaris-typeorm";
import {EntityFilter, PolarisGraphQLContext, RealitiesHolder} from "@enigmatis/polaris-common";
import {PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger";
import {entityFilterInputTypeName} from "@enigmatis/polaris-schema";

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
            info: any,
        ) => {
            this.logger.debug('Data version middleware started job', context);
            if(Object.keys(info.schema._queryType._fields).includes(info.fieldName)) {
                const datesFilterArgumentName = this.getDatesFilterArgumentName(info);
                if(datesFilterArgumentName) {
                    context.entityDateRangeFilter = this.getEntityDateRangeFilter(args[datesFilterArgumentName]);
                }
            }
            const result = await resolve(root, args, context, info);
            this.logger.debug('Data version middleware finished job', context);
            return result;
        }
    }

    private getDatesFilterArgumentName(info: any): string | undefined {
        let argumentName;
        info.schema._queryType._fields[info.fieldName].args.forEach((arg: any) => {
            if(arg.type.name === entityFilterInputTypeName) {
                argumentName = arg.name;
            }
        });
        return argumentName;
    }

    private getEntityDateRangeFilter(args: any): EntityFilter {
        this.formatDatesToIsoString(args);
        const entityFilter: EntityFilter = {creationTimeFilter: {}, lastUpdateTimeFilter: {}};
        Object.assign(entityFilter.creationTimeFilter, args.creationTime);
        Object.assign(entityFilter.lastUpdateTimeFilter, args.lastUpdateTime);
        return entityFilter;
    }

    private formatDatesToIsoString(args: any) {
        Object.keys(args).forEach(key => {
            Object.keys(args[key]).forEach(val => {
                if(val) {
                    args[key][val] = new Date(args[key][val]).toISOString();
                }
            })
        });
        // Object.keys(args.creationTime).forEach(value => {
        //     if(value) {
        //         args.creationTime[value] = new Date(args.creationTime[value]).toISOString();
        //     }
        // });
        // Object.keys(args.lastUpdateTime).forEach(value => {
        //    if(value) {
        //        args.lastUpdateTime[value] = new Date(args.lastUpdateTime[value]).toISOString();
        //    }
        // });
    }
}
