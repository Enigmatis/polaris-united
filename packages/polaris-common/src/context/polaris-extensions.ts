import { IrrelevantEntitiesResponse, PolarisWarning } from '..';

export interface PolarisExtensions {
    dataVersion: number;
    irrelevantEntities?: IrrelevantEntitiesResponse;
    warnings?: PolarisWarning[];
    totalCount?: number;
    snapResponse?: {
        snapshotMetadataId: string;
    };
    prefetchBuffer?: any[];
}
