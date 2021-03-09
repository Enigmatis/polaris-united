export interface RepositoryEntity {
    id: string;
    createdBy: string;
    creationTime: Date;
    lastUpdatedBy?: string;
    lastUpdateTime?: Date;
    realityId: number;
    dataVersion: number;
}
