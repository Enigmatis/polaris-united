import { getConnectionForReality, PolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import {
    RealitiesHolder,
    DataLoaderInitializer,
    PolarisGraphQLContext,
} from '@enigmatis/polaris-common';
import * as DataLoader from 'dataloader';

export class DataLoaderService implements DataLoaderInitializer {
    constructor(
        private supportedRealities: RealitiesHolder,
        private connectionManager: PolarisConnectionManager | undefined,
    ) {}

    public initDataLoader = (className: any, context: PolarisGraphQLContext) =>
        new DataLoader<string, any>(
            async (ids: readonly string[]): Promise<any> => {
                const entities: any[] = await getConnectionForReality(
                    context.reality.id,
                    this.supportedRealities as any,
                    this.connectionManager as PolarisConnectionManager,
                )
                    .getRepository<typeof className>(className.constructor.name, context)
                    .findByIds(ids as any);
                const entitiesMap: { [key: string]: typeof className } = {};
                entities.forEach((entity) => {
                    entitiesMap[entity.getId()] = entity;
                });
                return ids.map((key) => entitiesMap[key]);
            },
        );
}
