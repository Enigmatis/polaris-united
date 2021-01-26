import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { FindManyOptions } from 'typeorm';

export class PolarisFindManyOptions<Entity> {
    public criteria: FindManyOptions<Entity> | any;
    public context: PolarisGraphQLContext;

    constructor(criteria: FindManyOptions<Entity> | any, context: PolarisGraphQLContext) {
        this.criteria = criteria;
        this.context = context;
    }
}
