import {Connection, ConnectionOptions, EntitySchema, ObjectType, QueryRunner} from 'typeorm';
import {PolarisEntityManager} from './polaris-entity-manager';
import {PolarisRepository} from './polaris-repository';

/**
 * Connection is a single database ORM connection to a specific database.
 * Its not required to be a database connection, depend on database type it can create connection pool.
 * You can have multiple typeorm-bypasses to multiple databases in your application.
 */
export class PolarisConnection extends Connection {
    // @ts-ignore
    public manager: PolarisEntityManager;

    public queryRunners: Map<string, QueryRunner>;
    constructor(options: ConnectionOptions) {
        super(options);
        this.queryRunners = new Map<string, QueryRunner>();
    }
    /**
     * Gets repository for the given entity.
     */
    // @ts-ignore
    public getRepository<Entity>(
        target: ObjectType<Entity> | EntitySchema<Entity> | string,
    ): PolarisRepository<Entity> {
        return this.manager.getRepository(target);
    }

    public hasRepository<Entity>(
        target: ObjectType<Entity> | EntitySchema<Entity> | string,
    ): boolean {
        return this.manager.hasRepository(target);
    }
    public addQueryRunner(id: string, queryRunner: QueryRunner) {
        this.queryRunners.set(id, queryRunner);
    }
    public removeQueryRunner(id: string) {
        this.queryRunners.delete(id);
    }
}
