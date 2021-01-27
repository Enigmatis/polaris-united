import { Connection, ConnectionOptions, EntitySchema, ObjectType } from 'typeorm';
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
        let entityManager = this.manager;
        if (context?.requestHeaders?.requestId) {
            const existingEntityManager = this.entityManagers.get(context.requestHeaders.requestId);
            if (existingEntityManager) {
                entityManager = existingEntityManager;
            } else {
                entityManager = new PolarisEntityManager(this, this.createQueryRunner(), context);
                this.entityManagers.set(context.requestHeaders.requestId, entityManager);
            }
        }
        return entityManager.getRepository(target);
    }

    public async close(): Promise<void> {
        await this.removeAllPolarisEntityManagers();
        return super.close();
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

    public getPolarisEntityManager(context: PolarisGraphQLContext) {
        if (context?.requestHeaders?.requestId) {
            return this.entityManagers.get(context.requestHeaders.requestId);
        }
    }

    public addPolarisEntityManager(id: string, entityManager: PolarisEntityManager) {
        if (!this.entityManagers.get(id)) {
            this.entityManagers.set(id, entityManager);
        }
    }
    public async removePolarisEntityManager(id: string) {
        if (!this.entityManagers.get(id)?.queryRunner?.isReleased) {
            await this.entityManagers.get(id)?.queryRunner?.release();
        }
        this.entityManagers.delete(id);
    }
    public removePolarisEntityManagerWithContext(context: PolarisGraphQLContext) {
        if (context?.requestHeaders?.requestId) {
            return this.removePolarisEntityManager(context.requestHeaders.requestId);
        }
    }
    public async removeAllPolarisEntityManagers() {
        for (const em of this.entityManagers.values()) {
            if (!em?.queryRunner?.isReleased) {
                await em.queryRunner?.release();
            }
        }
        this.entityManagers.clear();
    }
}
