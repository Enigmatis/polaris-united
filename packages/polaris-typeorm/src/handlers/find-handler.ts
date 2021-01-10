import { PolarisGraphQLContext, PolarisRequestHeaders } from '@enigmatis/polaris-common';
import { FindManyOptions, FindOneOptions, In } from 'typeorm';

const realityIdCriteria = (includeLinkedOper: boolean, headers: PolarisRequestHeaders) =>
    includeLinkedOper && headers.realityId !== 0 && headers.includeLinkedOper
        ? In([headers.realityId, 0])
        : headers.realityId || 0;

export class FindHandler {
    public findConditions<Entity>(
        includeLinkedOper: boolean,
        context: PolarisGraphQLContext,
        criteria?: string | any[] | FindManyOptions<Entity> | FindOneOptions<Entity>,
        shouldIncludeDeletedEntities: boolean = false,
    ) {
        const headers: PolarisRequestHeaders = context?.requestHeaders || {};

        let polarisCriteria: any;
        if (typeof criteria === 'string') {
            polarisCriteria = { where: { id: criteria } };
        } else if (criteria instanceof Array) {
            polarisCriteria = { where: { id: In(criteria) } };
        } else {
            polarisCriteria = criteria || {};
        }

        polarisCriteria.where = { ...polarisCriteria.where };
        if (polarisCriteria.where.deleted === undefined && !shouldIncludeDeletedEntities) {
            polarisCriteria.where.deleted = false;
        }
        if (polarisCriteria.where.realityId === undefined) {
            polarisCriteria.where.realityId = realityIdCriteria(includeLinkedOper, headers);
        }
        return polarisCriteria;
    }
}
