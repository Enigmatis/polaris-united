import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { DeepPartial } from 'typeorm';

export class PolarisSaveOptions<Entity, T extends DeepPartial<Entity>> {
    public entities: T | T[];
    public context: PolarisGraphQLContext;

    constructor(entities: T[] | T, context: PolarisGraphQLContext) {
        this.entities = entities;
        this.context = context;
    }
}
