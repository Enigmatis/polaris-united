import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    DataVersion,
    getConnectionForReality,
    PolarisConnectionManager,
} from '@enigmatis/polaris-typeorm';

export class DataVersionMiddleware {
    public readonly connectionManager?: PolarisConnectionManager;
    public readonly realitiesHolder: RealitiesHolder;
    public readonly logger: PolarisGraphQLLogger;

    constructor(
        private enableDataVersionMapping: boolean,
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
            if (
                !root &&
                info?.operation?.operation === 'query' &&
                this.enableDataVersionMapping
            ) {
                const rootReturnType =
                    info.returnType.ofType?.ofType?.name ||
                    info.returnType.ofType?.ofType?.ofType?.name;
                if (rootReturnType) {
                    const mapping = this.loadDVRelations(
                        rootReturnType,
                        rootReturnType,
                        info.fieldNodes[0],
                        info,
                    );
                    if (mapping) {
                        const dvMapping = new Map([[rootReturnType, mapping]]);
                        context.dataVersionContext = {
                            ...context.dataVersionContext,
                            mapping: dvMapping,
                        };
                    }
                }
            }
            const result = await resolve(root, args, context, info);
            let finalResult = result;
            if (
                !root &&
                context.requestHeaders &&
                context.requestHeaders.dataVersion &&
                !isNaN(context.requestHeaders.dataVersion) &&
                result !== undefined &&
                !context.dataVersionContext?.mapping &&
                result !== null
            ) {
                if (Array.isArray(result)) {
                    finalResult = result.filter((entity) =>
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
            if (context.returnedExtensions?.globalDataVersion === undefined) {
                await this.updateDataVersionInReturnedExtensions(context);
            }
            this.logger.debug('Data version middleware finished job', context);
            return finalResult;
        };
    }

    public async updateDataVersionInReturnedExtensions(context: PolarisGraphQLContext) {
        if (
            context?.requestHeaders?.realityId == null ||
            !this.connectionManager?.connections?.length
        ) {
            return;
        }
        const connection = getConnectionForReality(
            context.requestHeaders.realityId,
            this.realitiesHolder,
            this.connectionManager,
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

    public loadDVRelations(root: string, newRoot: string, info: any, rootInfo: any): any {
        const relations = new Map();
        // for every selection in root
        for (const selection of info.selectionSet.selections) {
            // if that selection has children or its a fragment spread
            if (selection.selectionSet || selection.kind === 'FragmentSpread') {
                let key = newRoot;
                let newInfo = selection;
                if (selection.kind === 'FragmentSpread') {
                    newInfo = rootInfo.fragments[selection.name.value];
                } else if (selection.kind !== 'InlineFragment') {
                    key = selection.name.value;
                }
                const res = this.loadDVRelations(newRoot, key, newInfo, rootInfo);
                this.pushDVMapping(relations, key, res);
            }
        }
        return relations.size > 0 ? relations : undefined;
    }

    pushDVMapping(map: Map<any, any>, key: any, value: any) {
        if (value) {
            if (map.has(key)) {
                const values = [...value.keys()];
                values.filter((val) => {
                    if (!map.get(val)) {
                        map.get(key).push(val);
                    }
                });
            } else {
                map.set(key, [value]);
            }
        } else {
            map.set(key, undefined);
        }
    }
}
