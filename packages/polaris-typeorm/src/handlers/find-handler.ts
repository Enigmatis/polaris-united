import { PolarisGraphQLContext, PolarisRequestHeaders } from '@enigmatis/polaris-common';
import { Brackets, FindManyOptions, FindOneOptions, In, SelectQueryBuilder } from 'typeorm';

const realityIdCriteria = (includeLinkedOper: boolean, headers: PolarisRequestHeaders) =>
    includeLinkedOper && headers.realityId !== 0 && headers.includeLinkedOper
        ? In([headers.realityId, 0])
        : headers.realityId || 0;

export class FindHandler {
    public applyFindConditionsToQueryBuilder<Entity>(
        includeLinkedOper: boolean,
        context: PolarisGraphQLContext,
        qb: SelectQueryBuilder<any>,
        criteria?: string | any[] | FindManyOptions<Entity> | FindOneOptions<Entity>,
        shouldIncludeDeletedEntities: boolean = false,
    ): SelectQueryBuilder<any> {
        const headers: PolarisRequestHeaders = context?.requestHeaders || {};
        qb = this.applyRealityCondition(criteria, includeLinkedOper, headers, qb);
        const applyUserConditions = this.applyUserConditions(criteria, qb);
        qb = applyUserConditions.qb;
        if (applyUserConditions.shouldAddDeleteCondition && !shouldIncludeDeletedEntities) {
            qb = qb.andWhere(`${qb.alias}.deleted = :deleted`, { deleted: false });
        }
        return qb;
    }

    private applyUserConditions<Entity>(criteria: any, qb: SelectQueryBuilder<any>) {
        let shouldAddDeleteCondition: boolean = true;
        if (typeof criteria === 'string') {
            qb = qb.andWhere(`${qb.alias}.id = :id`, { id: criteria });
        } else if (criteria instanceof Array) {
            qb = qb.andWhereInIds(criteria);
        } else {
            if (criteria && criteria.where) {
                if (criteria.where.deleted !== undefined) {
                    this.deleteFindConditionIfRedundant(criteria.where);
                    shouldAddDeleteCondition = false;
                }
                if (criteria.where instanceof Array && criteria.where.length > 0) {
                    qb = qb.andWhere(
                        new Brackets((qb2) => {
                            qb2.where(criteria.where[0]);
                            for (let i = 1; i < criteria.where.length; i++) {
                                qb2.orWhere(criteria.where[i]);
                            }
                        }),
                    );
                } else {
                    qb.andWhere(criteria.where);
                }
            }
        }
        return { qb, shouldAddDeleteCondition };
    }

    private applyRealityCondition<Entity>(
        criteria: any,
        includeLinkedOper: boolean,
        headers: PolarisRequestHeaders,
        qb: SelectQueryBuilder<any>,
    ) {
        if ((criteria as any)?.where?.realityId === undefined) {
            const parameters = {
                realityId: realityIdCriteria(includeLinkedOper, headers),
            };
            const realityId = `${qb.alias}.realityId = :realityId`;
            qb =
                qb.expressionMap.wheres.length === 0
                    ? qb.where(realityId, parameters)
                    : qb.andWhere(realityId, parameters);
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
