import {
    DeepPartial,
    DeleteResult,
    FindConditions,
    FindManyOptions,
    FindOneOptions,
    ObjectID,
    ObjectLiteral,
    Repository,
    SaveOptions,
    SelectQueryBuilder,
    UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PolarisEntityManager } from '..';

/**
 * Repository is supposed to work with your entity objects. Find entities, insert, update, delete, etc.
 */
export class PolarisRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    /**
     * Saves one or many given entities.
     */
    // @ts-ignore
    public save<T extends DeepPartial<Entity>>(
        entityOrEntities: T | T[],
        options?: SaveOptions,
    ): Promise<T | T[]> {
        return this.manager.save<Entity, T>(
            this.metadata.target as any,
            entityOrEntities as any,
            options,
        );
    }

    /**
     * Updates entity partially. Entity can be found by a given conditions.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Executes fast and efficient UPDATE query.
     * Does not check if entity exist in the database.
     */

    // @ts-ignore
    public update(
        criteria:
            | string
            | string[]
            | number
            | number[]
            | Date
            | Date[]
            | ObjectID
            | ObjectID[]
            | FindConditions<Entity>,
        partialEntity: QueryDeepPartialEntity<Entity>,
    ): Promise<UpdateResult> {
        return this.manager.update(this.metadata.target as any, criteria, partialEntity);
    }

    /**
     * Deletes entities by a given criteria.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Executes fast and efficient DELETE query.
     * Does not check if entity exist in the database.
     */
    // @ts-ignore
    public delete(
        criteria:
            | string
            | string[]
            | number
            | number[]
            | Date
            | Date[]
            | ObjectID
            | ObjectID[]
            | FindConditions<Entity>,
    ): Promise<DeleteResult> {
        return this.manager.delete(this.metadata.target as any, criteria);
    }

    /**
     * Counts entities that match given find options or conditions.
     */
    // @ts-ignore
    public count(
        optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity>,
    ): Promise<number> {
        return this.manager.count(this.metadata.target as any, optionsOrConditions);
    }

    /**
     * Finds entities that match given find options or conditions.
     */
    // @ts-ignore
    public find(
        optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity>,
    ): Promise<Entity[]> {
        return this.manager.find(this.metadata.target as any, optionsOrConditions);
    }

    /**
     * Used for online paging.
     * Finds entities and sorts them by the given data version(including their sub-entities)
     */
    public findSortedByDataVersion(
        optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity>,
    ): Promise<Entity[]> {
        return ((this.manager as unknown) as PolarisEntityManager).findSortedByDataVersion(
            this.metadata.target as any,
            optionsOrConditions,
        );
    }

    /**
     * Finds first entity that matches given conditions.
     */
    // @ts-ignore
    public findOne(
        optionsOrConditions?:
            | string
            | number
            | Date
            | ObjectID
            | FindOneOptions<Entity>
            | FindConditions<Entity>,
        maybeOptions?: FindOneOptions<Entity>,
    ): Promise<Entity | undefined> {
        return this.manager.findOne(
            this.metadata.target as any,
            optionsOrConditions as any,
            maybeOptions,
        );
    }
    /**
     * Finds entities by ids.
     * Optionally find options can be applied.
     */
    // @ts-ignore
    public findByIds(
        ids: any[],
        optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity>,
    ): Promise<Entity[]> {
        return this.manager.findByIds(this.metadata.target as any, ids, optionsOrConditions);
    }
    /**
     * Creates a new query builder that can be used to build a sql query.
     */

    public createQueryBuilder(alias?: string): SelectQueryBuilder<Entity> {
        return ((this
            .manager as unknown) as PolarisEntityManager).createQueryBuilderWithPolarisConditions<Entity>(
            this.metadata.target as any,
            alias || this.metadata.name,
        );
    }

    public createQueryBuilderWithDeletedEntities(alias?: string): SelectQueryBuilder<Entity> {
        return ((this
            .manager as unknown) as PolarisEntityManager).createQueryBuilderWithPolarisConditions<Entity>(
            this.metadata.target as any,
            alias || this.metadata.name,
            undefined,
            true,
        );
    }
}
