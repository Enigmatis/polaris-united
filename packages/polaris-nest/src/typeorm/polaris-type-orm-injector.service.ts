import {
    EntitySchema,
    getConnectionForReality,
    ObjectType,
    PolarisConnection,
    PolarisGraphQLContext,
    PolarisRepository,
    PolarisServerConfig,
} from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { PolarisServerConfigService } from '../polaris-server-config/polaris-server-config.service';

@Injectable({ scope: Scope.REQUEST })
export class PolarisTypeORMInjector {
    private config: PolarisServerConfig;
    constructor(
        @Inject(CONTEXT) private readonly context: PolarisGraphQLContext,
        @Inject(PolarisServerConfigService)
        private readonly configService: PolarisServerConfigService,
    ) {
        this.config = this.configService.getPolarisServerConfig();
    }

    public getConnection(): PolarisConnection {
        if (this.config.connectionManager) {
            return getConnectionForReality(
                this.context.reality.id,
                this.config.supportedRealities,
                this.config.connectionManager,
            );
        } else {
            throw new Error('No connection manager is defined');
        }
    }

    public getRepository<Entity>(
        entity: ObjectType<Entity> | EntitySchema<Entity> | string,
    ): PolarisRepository<Entity> {
        return this.getConnection().getRepository(entity, this.context);
    }
}
