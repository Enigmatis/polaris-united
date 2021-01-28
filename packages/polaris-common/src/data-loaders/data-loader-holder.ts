import DataLoader from 'dataloader';

export class DataLoaderHolder {
    entityType: string;
    realityId: number;
    dataLoader: DataLoader<string, any>;

    constructor(entityType: string, realityId: number, dataLoader: DataLoader<string, any>) {
        this.realityId = realityId;
        this.entityType = entityType;
        this.dataLoader = dataLoader;
    }
}
