import { PaginatedContext } from './paginated-context';

export interface SnapshotContext extends PaginatedContext {
    startIndex?: number;
    prefetchBuffer?: any[];
    totalCount?: number;
}
