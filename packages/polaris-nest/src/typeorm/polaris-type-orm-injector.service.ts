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

    public getConnection(): PolarisConnection | undefined {
        if (this.config.connectionManager) {
            return this.context.reality
                ? getConnectionForReality(
                      this.context.reality.id,
                      this.config.supportedRealities,
                      this.config.connectionManager,
                  )
                : undefined;
        } else {
            throw new Error('No connection manager is defined');
        }
    }

    public getRepository<Entity>(
        entity: ObjectType<Entity> | EntitySchema<Entity> | string,
    ): PolarisRepository<Entity> {
        const connection = this.getConnection();
        return connection
            ? connection.getRepository(entity, this.context)
            : ((undefined as unknown) as PolarisRepository<Entity>);
    }
}
