import { EntityFilter } from '@enigmatis/polaris-common';
import { SelectQueryBuilder } from 'typeorm';

export const addDateRangeCriteria = (
    qb: SelectQueryBuilder<any>,
    dateRangeFilter: EntityFilter,
    entityTableName: string,
) => {
    if (dateRangeFilter.creationTimeFilter?.gt) {
        qb.andWhere(`${entityTableName}.creationTime > :gt`, {
            gt: dateRangeFilter.creationTimeFilter?.gt,
        });
    } else if (dateRangeFilter.creationTimeFilter?.gte) {
        qb.andWhere(`${entityTableName}.creationTime >= :gte`, {
            gte: dateRangeFilter.creationTimeFilter?.gte,
        });
    }
    if (dateRangeFilter.creationTimeFilter?.lt) {
        qb.andWhere(`${entityTableName}.creationTime < :lt`, {
            lt: dateRangeFilter.creationTimeFilter?.lt,
        });
    } else if (dateRangeFilter.creationTimeFilter?.lte) {
        qb.andWhere(`${entityTableName}.creationTime <= :lte`, {
            lte: dateRangeFilter.creationTimeFilter?.lte,
        });
    }

    if (dateRangeFilter.lastUpdateTimeFilter?.gt) {
        qb.andWhere(`${entityTableName}.lastUpdateTime > :gt`, {
            gt: dateRangeFilter.lastUpdateTimeFilter?.gt,
        });
    } else if (dateRangeFilter.lastUpdateTimeFilter?.gte) {
        qb.andWhere(`${entityTableName}.lastUpdateTime >= :gte`, {
            gte: dateRangeFilter.lastUpdateTimeFilter?.gte,
        });
    }
    if (dateRangeFilter.lastUpdateTimeFilter?.lt) {
        qb.andWhere(`${entityTableName}.lastUpdateTime < :lt`, {
            lt: dateRangeFilter.lastUpdateTimeFilter?.lt,
        });
    } else if (dateRangeFilter.lastUpdateTimeFilter?.lte) {
        qb.andWhere(`${entityTableName}.lastUpdateTime <= :lte`, {
            lte: dateRangeFilter.lastUpdateTimeFilter?.lte,
        });
    }
};
