import { IrrelevantEntitiesResponse, PolarisWarning } from '..';

export interface PolarisExtensions {
    dataVersion: number;
    lastIdInDataVersion?: string;
    lastDataVersionInPage?: number;
    irrelevantEntities?: IrrelevantEntitiesResponse;
    warnings?: PolarisWarning[];
    totalCount?: number;
    snapResponse?: {
        snapshotMetadataId: string;
    };
    prefetchBuffer?: any[];
}
