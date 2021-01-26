import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { FindOneOptions } from 'typeorm';

export class PolarisFindOneOptions<Entity> {
    public criteria: string | string[] | FindOneOptions<Entity> | any;
    public context: PolarisGraphQLContext;

    constructor(
        criteria: string | string[] | FindOneOptions<Entity> | any,
        context: PolarisGraphQLContext,
    ) {
        this.criteria = criteria;
        this.context = context;
    }
}
