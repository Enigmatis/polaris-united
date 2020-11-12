import { IrrelevantEntitiesResponse, PolarisError } from '..';
import { PolarisWarning } from './polaris-warning';

export interface PolarisExtensions {
    globalDataVersion: number;
    irrelevantEntities?: IrrelevantEntitiesResponse;
    warnings?: PolarisWarning[];
    errors?: PolarisError[];
    totalCount?: number;
    snapResponse?: {
        snapshotMetadataId: string;
        pagesIds: string[];
    };
    prefetchBuffer?: any[];
}
