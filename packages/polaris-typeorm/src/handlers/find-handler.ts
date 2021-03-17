import { PolarisGraphQLContext, PolarisRequestHeaders } from '@enigmatis/polaris-common';
import { Brackets, FindManyOptions, FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { setWhereCondition, setWhereInIdsCondition } from '../utils/query-builder-util';

export class FindHandler {
    public applyFindConditionsToQueryBuilder<Entity>(
        includeLinkedOper: boolean,
        context: PolarisGraphQLContext,
        qb: SelectQueryBuilder<any>,
        criteria?: string | any[] | FindManyOptions<Entity> | FindOneOptions<Entity>,
        shouldIncludeDeletedEntities: boolean = false,
    ): SelectQueryBuilder<any> {
        const headers: PolarisRequestHeaders = context?.requestHeaders || {};
        this.applyRealityCondition(criteria, includeLinkedOper, headers, qb);
        FindHandler.applyUserConditions(criteria, qb);
        this.applyDeleteCondition(criteria as any, shouldIncludeDeletedEntities, qb);
        return qb;
    }

    private applyDeleteCondition<Entity>(
        criteria: any,
        shouldIncludeDeletedEntities: boolean,
        qb: SelectQueryBuilder<any>,
    ) {
        let shouldAddDeleteCondition: boolean = true;
        if (criteria?.where?.deleted !== undefined) {
            this.deleteFindConditionIfRedundant(criteria.where);
            shouldAddDeleteCondition = false;
        }
        if (shouldAddDeleteCondition && !shouldIncludeDeletedEntities) {
            qb = setWhereCondition(qb, `${qb.alias}.deleted = :deleted`, { deleted: false });
        }
        return qb;
    }

    public static applyUserConditions<Entity>(criteria: any, qb: SelectQueryBuilder<any>) {
        if (typeof criteria === 'string') {
            setWhereCondition(qb, `${qb.alias}.id = :id`, { id: criteria });
        } else if (criteria instanceof Array) {
            setWhereInIdsCondition(qb, criteria);
        } else {
            if (criteria && criteria.where) {
                let whereCondition: any;
                if (criteria.where instanceof Array && criteria.where.length > 0) {
                    whereCondition = new Brackets((qb2) => {
                        qb2.where(criteria.where[0]);
                        for (let i = 1; i < criteria.where.length; i++) {
                            qb2.orWhere(criteria.where[i]);
                        }
                    });
                }
                setWhereCondition(qb, whereCondition ?? criteria.where);
            }
        }
    }

    private applyRealityCondition<Entity>(
        criteria: any,
        includeLinkedOper: boolean,
        headers: PolarisRequestHeaders,
        qb: SelectQueryBuilder<any>,
    ) {
        if ((criteria as any)?.where?.realityId === undefined) {
            const realityIdFromHeader = headers.realityId || 0;
            qb = setWhereCondition(
                qb,
                includeLinkedOper && headers.realityId !== 0 && headers.includeLinkedOper
                    ? `${qb.alias}.realityId in (${headers.realityId},0)`
                    : `${qb.alias}.realityId = ${realityIdFromHeader}`,
            );
        }
        return qb;
    }

    private deleteFindConditionIfRedundant(polarisCriteria: any) {
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
