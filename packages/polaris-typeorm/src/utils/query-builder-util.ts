import { EntityFilter, DateRangeFilter } from '@enigmatis/polaris-common';
import { SelectQueryBuilder } from 'typeorm';

const addDateRangeFilterByFieldName = (
    qb: SelectQueryBuilder<any>,
    dateRangeFilter: DateRangeFilter,
    entityTableName: string,
    filteredFieldName: string,
) => {
    if (dateRangeFilter?.gte) {
        qb.andWhere(`${entityTableName}.${filteredFieldName} > :gte`, {
            gte: dateRangeFilter?.gte,
        });
    } else if (dateRangeFilter?.gt) {
        qb.andWhere(`${entityTableName}.${filteredFieldName} >= :gt`, {
            gt: dateRangeFilter?.gt,
        });
    }
    if (dateRangeFilter?.lte) {
        qb.andWhere(`${entityTableName}.${filteredFieldName} < :lte`, {
            lte: dateRangeFilter?.lte,
        });
    } else if (dateRangeFilter?.lt) {
        qb.andWhere(`${entityTableName}.${filteredFieldName} <= :lt`, {
            lt: dateRangeFilter?.lt,
        });
    }
};

export const addDateRangeCriteria = (
    qb: SelectQueryBuilder<any>,
    dateRangeFilter: EntityFilter,
    entityTableName: string,
) => {
    if (dateRangeFilter.creationTimeFilter) {
        addDateRangeFilterByFieldName(
            qb,
            dateRangeFilter.creationTimeFilter,
            entityTableName,
            'creationTime',
        );
    }
    if (dateRangeFilter.lastUpdateTimeFilter) {
        addDateRangeFilterByFieldName(
            qb,
            dateRangeFilter.lastUpdateTimeFilter,
            entityTableName,
            'lastUpdateTime',
        );
    }
};
