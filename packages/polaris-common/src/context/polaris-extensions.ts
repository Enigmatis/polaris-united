import { IrrelevantEntitiesResponse, PolarisError } from '..';
import { PolarisWarning } from './polaris-warning';

export interface PolarisExtensions {
    globalDataVersion: number;
    irrelevantEntities?: IrrelevantEntitiesResponse;
    warnings?: string[];
    errors?: string[];
    totalCount?: number;
    snapResponse?: {
        snapshotMetadataId: string;
        pagesIds: string[];
    };
    prefetchBuffer?: any[];
}
