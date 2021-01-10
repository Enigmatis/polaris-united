import { Connection, ConnectionOptions, EntitySchema, ObjectType, QueryRunner } from 'typeorm';
import { PolarisEntityManager } from './polaris-entity-manager';
import { PolarisRepository } from './polaris-repository';
import { PolarisGraphQLContext } from '@enigmatis/polaris-common';

/**
 * Connection is a single database ORM connection to a specific database.
 * Its not required to be a database connection, depend on database type it can create connection pool.
 * You can have multiple typeorm-bypasses to multiple databases in your application.
 */
export class PolarisConnection extends Connection {
    // @ts-ignore
    public manager: PolarisEntityManager;
    public entityManagers: Map<string, PolarisEntityManager>;

    constructor(options: ConnectionOptions) {
        super(options);
        this.entityManagers = new Map<string, PolarisEntityManager>();
    }
    /**
     * Gets repository for the given entity.
     */
    // @ts-ignore
    public getRepository<Entity>(
        target: ObjectType<Entity> | EntitySchema<Entity> | string,
        context?: PolarisGraphQLContext,
    ): PolarisRepository<Entity> {
        if (context?.requestHeaders.requestId) {
            return (
                this.entityManagers.get(context.requestHeaders.requestId)?.getRepository(target) ??
                this.manager.getRepository(target)
            );
        }
        return this.manager.getRepository(target);
    }

    public hasRepository<Entity>(
        target: ObjectType<Entity> | EntitySchema<Entity> | string,
        context?: PolarisGraphQLContext,
    ): boolean {
        if (context?.requestHeaders.requestId) {
            return (
                this.entityManagers.get(context.requestHeaders.requestId)?.hasRepository(target) ??
                this.manager.hasRepository(target)
            );
        }
        return this.manager.hasRepository(target);
    }

    public addPolarisEntityManager(id: string, entityManager: PolarisEntityManager) {
        this.entityManagers.set(id, entityManager);
    }
    public removePolarisEntityManager(id: string) {
        this.entityManagers.delete(id);
    }
}
