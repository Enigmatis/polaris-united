import {
    DataLoaderHolder,
    DataLoaderInitializer,
    PolarisGraphQLContext,
} from '@enigmatis/polaris-common';
import * as DataLoader from 'dataloader';

export const getDataLoader = (
    entityType: string,
    context: PolarisGraphQLContext,
    className: any,
) => {
    const dataLoader = context.dataloaderContext?.dataLoaders?.find(
        (value) => value.entityType === entityType,
    );
    if (dataLoader) {
        return dataLoader.dataLoader;
    } else {
        const dataLoaderService = context.dataloaderContext.dataLoaderService;
        const newDataLoader = createDataLoader(dataLoaderService, entityType, className, context);
        context.dataloaderContext?.dataLoaders?.push(newDataLoader);
        return newDataLoader.dataLoader;
    }
};

export const createDataLoader = (
    dataLoaderService: DataLoaderInitializer,
    entityType: string,
    className: any,
    context: PolarisGraphQLContext,
) => {
    const dataLoader: DataLoader<string, any> = dataLoaderService.initDataLoader(
        className,
        context,
    );
    return new DataLoaderHolder(entityType, dataLoader);
};
