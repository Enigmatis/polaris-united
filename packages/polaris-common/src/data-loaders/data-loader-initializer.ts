import DataLoader from 'dataloader';

export interface DataLoaderInitializer {
    initDataLoader(realityId: number, className: any): DataLoader<string, any>;
}
