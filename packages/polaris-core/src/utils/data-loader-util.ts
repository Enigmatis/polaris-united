import {
    DataLoaderHolder,
    DataLoaderInitializer,
    PolarisGraphQLContext,
} from '@enigmatis/polaris-common';
import DataLoader = require('dataloader');

export const getDataLoader = (
    entityType: string,
    context: PolarisGraphQLContext,
    className: any,
) => {
    const realityId = context.reality.id;
    const dataLoader = context.dataLoaders?.find((value) => value.entityType === entityType);
    if (dataLoader) {
        return dataLoader.dataLoader;
    } else {
        const dataLoaderService = context.dataLoaderService!;
        const newDataLoader = createDataLoader(
            dataLoaderService,
            realityId,
            entityType,
            className,
            context,
        );
        context.dataLoaders?.push(newDataLoader);
        return newDataLoader.dataLoader;
    }
};

export const createDataLoader = (
    dataLoaderService: DataLoaderInitializer,
    realityId: number,
    entityType: string,
    className: any,
    context: PolarisGraphQLContext,
) => {
    const dataLoaderPerReality: DataLoader<string, any> = dataLoaderService.initDataLoader(
        realityId,
        className,
        context,
    );
    return new DataLoaderHolder(entityType, realityId, dataLoaderPerReality);
};
