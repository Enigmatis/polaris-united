import {DataVersion, SnapshotMetadata, SnapshotPage} from '@enigmatis/polaris-typeorm';
import {ConnectionlessIrrelevantEntitiesCriteria} from './connectionless-irrelevant-entities-criteria';

export interface ConnectionlessConfiguration {
    getDataVersion(): Promise<DataVersion>;

    saveSnapshotPages(pages: SnapshotPage[]): void;

    saveSnapshotMetadata(metadata: SnapshotMetadata): Promise<SnapshotMetadata>;

    updateSnapshotPage(pageId: string, pageToUpdate: Partial<SnapshotPage>): void;

    updateSnapshotMetadata(metadataId: string, metadataToUpdate: Partial<SnapshotMetadata>): void;

    getIrrelevantEntities(typeName: string, criteria: ConnectionlessIrrelevantEntitiesCriteria): Promise<any[]>;

    getSnapshotPageById(id: string): Promise<SnapshotPage>;

    getSnapshotMetadataById(id: string): Promise<SnapshotMetadata | undefined>;

    deleteSnapshotPageBySecondsToBeOutdated(secondsToBeOutdated: number): void;

    deleteSnapshotMetadataBySecondsToBeOutdated(secondsToBeOutdated: number): void;

    startTransaction(): any;

    commitTransaction(client?: any): void;

    rollbackTransaction(client?: any): void;
}
