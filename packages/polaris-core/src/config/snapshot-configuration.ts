import { PagingConfiguration } from './paging-configuration';

export interface SnapshotConfiguration extends PagingConfiguration {
    snapshotCleaningInterval: number;
    secondsToBeOutdated: number;
    entitiesAmountPerFetch: number;
    autoSnapshot: boolean;
}
