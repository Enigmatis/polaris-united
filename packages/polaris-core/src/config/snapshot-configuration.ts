export interface SnapshotConfiguration {
    snapshotCleaningInterval: number;
    secondsToBeOutdated: number;
    entitiesAmountPerFetch: number;
    autoSnapshot: boolean;
}
