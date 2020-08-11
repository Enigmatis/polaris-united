import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
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
    UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CommonModel } from '..';
import { PolarisCriteria } from '../contextable-options/polaris-criteria';
import { PolarisFindManyOptions } from '../contextable-options/polaris-find-many-options';
import { PolarisFindOneOptions } from '../contextable-options/polaris-find-one-options';
import { PolarisSaveOptions } from '../contextable-options/polaris-save-options';

/**
 * Repository is supposed to work with your entity objects. Find entities, insert, update, delete, etc.
 */
export class PolarisRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    /**
     * Saves one or many given entities.
     */

    // @ts-ignore
    public save<T extends DeepPartial<Entity>>(
        context: PolarisGraphQLContext,
        entityOrEntities: T | T[],
        options?: SaveOptions,
    ): Promise<T | T[]> {
        return this.manager.save<T>(
            this.metadata.target as any,
            this.metadata.inheritanceTree[this.metadata.inheritanceTree.length - 1].name ===
                CommonModel.name
                ? (new PolarisSaveOptions(entityOrEntities, context) as any)
                : entityOrEntities,
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
        context: PolarisGraphQLContext,
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
        return this.manager.update(
            this.metadata.target as any,
            this.metadata.inheritanceTree[this.metadata.inheritanceTree.length - 1].name ===
                CommonModel.name
                ? (new PolarisCriteria(criteria, context) as any)
                : criteria,
            partialEntity,
        );
    }

    /**
     * Deletes entities by a given criteria.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Executes fast and efficient DELETE query.
     * Does not check if entity exist in the database.
     */
    // @ts-ignore
    public delete(
        context: PolarisGraphQLContext,
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
        return this.manager.delete(
            this.metadata.target as any,
            this.metadata.inheritanceTree[this.metadata.inheritanceTree.length - 1].name ===
                CommonModel.name
                ? (new PolarisCriteria(criteria, context) as any)
                : criteria,
        );
    }

    /**
     * Counts entities that match given find options or conditions.
     */
    // @ts-ignore
    public count(
        context: PolarisGraphQLContext,
        optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity>,
    ): Promise<number> {
        return this.manager.count(
            this.metadata.target as any,
            this.metadata.inheritanceTree[this.metadata.inheritanceTree.length - 1].name ===
                CommonModel.name
                ? (new PolarisFindManyOptions(optionsOrConditions, context) as any)
                : optionsOrConditions,
        );
    }

    /**
     * Finds entities that match given find options or conditions.
     */
    // @ts-ignore
    public find(
        context: PolarisGraphQLContext,
        optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity>,
    ): Promise<Entity[]> {
        return this.manager.find(
            this.metadata.target as any,
            this.metadata.inheritanceTree[this.metadata.inheritanceTree.length - 1].name ===
                CommonModel.name
                ? (new PolarisFindManyOptions(optionsOrConditions, context) as any)
                : optionsOrConditions,
        );
    }

    /**
     * Finds first entity that matches given conditions.
     */
    // @ts-ignore
    public findOne(
        context: PolarisGraphQLContext,
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
            this.metadata.inheritanceTree[this.metadata.inheritanceTree.length - 1].name ===
                CommonModel.name
                ? (new PolarisFindOneOptions(optionsOrConditions, context) as any)
                : optionsOrConditions,
            maybeOptions,
        );
    }
}
