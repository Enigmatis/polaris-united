import * as DataLoader from 'dataloader';

export class DataLoaderHolder {
    entityType: string;
    dataLoader: DataLoader<string, any>;

    constructor(entityType: string, dataLoader: DataLoader<string, any>) {
        this.entityType = entityType;
        this.dataLoader = dataLoader;
    }
}
