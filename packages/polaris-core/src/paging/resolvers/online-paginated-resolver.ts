export interface OnlinePaginatedResolver<T> {
    getData(): Promise<T[]>;
}
