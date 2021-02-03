import { getConnectionForReality, PolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import { RealitiesHolder, DataLoaderInitializer } from '@enigmatis/polaris-common';
import DataLoader = require('dataloader');

export class DataLoaderService implements DataLoaderInitializer {
    constructor(
        private supportedRealities: RealitiesHolder,
        private connectionManager: PolarisConnectionManager | undefined,
    ) {}

    public initDataLoader = (realityId: number, className: any) =>
        new DataLoader<string, any>(
            async (ids: readonly string[]): Promise<any> => {
                const entities: any[] = await getConnectionForReality(
                    realityId,
                    this.supportedRealities as any,
                    this.connectionManager as PolarisConnectionManager,
                )
                    .getRepository<typeof className>(className.constructor.name)
                    .findByIds(ids as any);
                const entitiesMap: { [key: string]: typeof className } = {};
                entities.forEach((entity) => {
                    entitiesMap[entity.getId()] = entity;
                });
                return ids.map((key) => entitiesMap[key]);
            },
        );
}
