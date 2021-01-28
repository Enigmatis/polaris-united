import { DataLoaderHolder, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import DataLoader from 'dataloader';

export const getDataLoader = (
    entityType: string,
    context: PolarisGraphQLContext,
    className: any,
) => {
    const realityId = context.reality.id;
    const dataLoader = context.dataLoaders?.find(
        (value) => value.realityId === realityId && value.entityType === entityType,
    );
    if (dataLoader) {
        return dataLoader.dataLoader;
    } else {
        const dataLoaderService = context.dataLoaderService;
        const newDataLoader = createDataLoader(dataLoaderService, realityId, entityType, className);
        context.dataLoaders?.push(newDataLoader);
        return newDataLoader.dataLoader;
    }
};

export const createDataLoader = (
    dataLoader: any,
    realityId: number,
    entityType: string,
    className: any,
) => {
    const dataLoaderPerReality: DataLoader<string, any> = dataLoader.initDataLoader(
        realityId,
        className,
    );
    return new DataLoaderHolder(entityType, realityId, dataLoaderPerReality);
};
