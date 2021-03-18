import { PolarisGraphQLContext, PolarisRequestHeaders } from '@enigmatis/polaris-common';
import { FindManyOptions, FindOneOptions, SelectQueryBuilder } from 'typeorm';
import {
    createOrWhereCondition,
    setWhereCondition,
    setWhereInIdsCondition,
} from '../utils/query-builder-util';

export class FindHandler {
    public applyFindConditionsToQueryBuilder<Entity>(
        includeLinkedOper: boolean,
        context: PolarisGraphQLContext,
        qb: SelectQueryBuilder<any>,
        criteria?: string | any[] | FindManyOptions<Entity> | FindOneOptions<Entity>,
        shouldIncludeDeletedEntities: boolean = false,
    ): void {
        const headers: PolarisRequestHeaders = context?.requestHeaders || {};
        this.applyRealityCondition(criteria, includeLinkedOper, headers, qb);
        FindHandler.applyCustomCriteria(criteria, qb);
        this.applyDeleteCondition(criteria as any, shouldIncludeDeletedEntities, qb);
    }

    private applyDeleteCondition<Entity>(
        criteria: any,
        shouldIncludeDeletedEntities: boolean,
        qb: SelectQueryBuilder<any>,
    ): void {
        let shouldAddDeleteCondition: boolean = true;
        if (criteria?.where?.deleted !== undefined) {
            this.deleteFindConditionIfRedundant(criteria.where);
            shouldAddDeleteCondition = false;
        }
        if (shouldAddDeleteCondition && !shouldIncludeDeletedEntities) {
            setWhereCondition(qb, `${qb.alias}.deleted = :deleted`, { deleted: false });
        }
    }

    public static applyCustomCriteria<Entity>(
        criteria: any,
        queryBuilder: SelectQueryBuilder<any>,
    ): void {
        if (typeof criteria === 'string') {
            setWhereCondition(queryBuilder, `${queryBuilder.alias}.id = :id`, { id: criteria });
        } else if (criteria instanceof Array) {
            setWhereInIdsCondition(queryBuilder, criteria);
        } else {
            if (criteria && criteria.where) {
                let whereCondition: any;
                if (criteria.where instanceof Array && criteria.where.length > 0) {
                    whereCondition = createOrWhereCondition(criteria);
                }
                setWhereCondition(queryBuilder, whereCondition ?? criteria.where);
            }
        }
    }

    private applyRealityCondition<Entity>(
        criteria: any,
        includeLinkedOper: boolean,
        headers: PolarisRequestHeaders,
        qb: SelectQueryBuilder<any>,
    ): void {
        if ((criteria as any)?.where?.realityId === undefined) {
            const realityIdFromHeader = headers.realityId || 0;
            setWhereCondition(
                qb,
                includeLinkedOper && headers.realityId !== 0 && headers.includeLinkedOper
                    ? `${qb.alias}.realityId in (${headers.realityId},0)`
                    : `${qb.alias}.realityId = ${realityIdFromHeader}`,
            );
        }
    }

    private deleteFindConditionIfRedundant(polarisCriteria: any): void {
        if (
            polarisCriteria.deleted?._type === 'in' &&
            ((polarisCriteria.deleted?._value[0] === true &&
                polarisCriteria.deleted?._value[1] === false) ||
                (polarisCriteria.deleted?._value[1] === true &&
                    polarisCriteria.deleted?._value[0] === false))
        ) {
            delete polarisCriteria.deleted;
        }
    }
}
