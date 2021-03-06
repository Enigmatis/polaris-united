export interface SnapshotPaginatedResolver<T> {
    totalCount(): Promise<number>;
    getData(startIndex?: number, pageSize?: number): Promise<T[]>;
}
