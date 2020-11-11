export interface EntityFilter {
    creationTimeFilter?: DateRangeFilter;
    lastUpdateTimeFilter?: DateRangeFilter;
}

interface DateRangeFilter {
    gt?: string;
    gte?: string;
    lt?: string;
    lte?: string;
}
