import { EntityFilter, DateRangeFilter } from '@enigmatis/polaris-common';
import { SelectQueryBuilder } from 'typeorm';

const addDateRangeFilterByFieldName = (
    qb: SelectQueryBuilder<any>,
    dateRangeFilter: DateRangeFilter,
    alias: string,
    filteredFieldName: string,
) => {
    if (dateRangeFilter?.gte) {
        qb.andWhere(`${alias}.${filteredFieldName} > :gte`, {
            gte: dateRangeFilter?.gte,
        });
    } else if (dateRangeFilter?.gt) {
        qb.andWhere(`${alias}.${filteredFieldName} >= :gt`, {
            gt: dateRangeFilter?.gt,
        });
    }
    if (dateRangeFilter?.lte) {
        qb.andWhere(`${alias}.${filteredFieldName} < :lte`, {
            lte: dateRangeFilter?.lte,
        });
    } else if (dateRangeFilter?.lt) {
        qb.andWhere(`${alias}.${filteredFieldName} <= :lt`, {
            lt: dateRangeFilter?.lt,
        });
    }
};

export const addDateRangeCriteria = (
    qb: SelectQueryBuilder<any>,
    dateRangeFilter: EntityFilter,
    alias: string,
) => {
    if (dateRangeFilter.creationTimeFilter) {
        addDateRangeFilterByFieldName(
            qb,
            dateRangeFilter.creationTimeFilter,
            alias,
            'creationTime',
        );
    }
    if (dateRangeFilter.lastUpdateTimeFilter) {
        addDateRangeFilterByFieldName(
            qb,
            dateRangeFilter.lastUpdateTimeFilter,
            alias,
            'lastUpdateTime',
        );
    }
};
