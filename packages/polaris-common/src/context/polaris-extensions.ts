import { IrrelevantEntitiesResponse } from '..';

export interface PolarisExtensions {
    dataVersion: number;
    irrelevantEntities?: IrrelevantEntitiesResponse;
    warnings?: string[];
    errors?: string[];
    totalCount?: number;
    snapResponse?: {
        snapshotMetadataId: string;
    };
    prefetchBuffer?: any[];
}
