export interface EntityFilter {
    creationTimeFilter?: DateRangeFilter;
    lastUpdateTimeFilter?: DateRangeFilter;
}

export interface DateRangeFilter {
    gt?: string;
    gte?: string;
    lt?: string;
    lte?: string;
}
