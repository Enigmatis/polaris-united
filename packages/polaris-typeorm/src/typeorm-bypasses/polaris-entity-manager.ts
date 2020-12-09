import { PolarisGraphQLContext, EntityFilter } from '@enigmatis/polaris-common';
import {
    Connection,
    DeepPartial,
    DeleteResult,
    EntityManager,
    EntitySchema,
    FindOneOptions,
    FindOptionsUtils,
    In,
    QueryRunner,
    SelectQueryBuilder,
    UpdateResult,
} from 'typeorm';
import { RepositoryNotFoundError } from 'typeorm/error/RepositoryNotFoundError';
import {
    PolarisCriteria,
    PolarisFindManyOptions,
    PolarisFindOneOptions,
    PolarisSaveOptions,
} from '..';
import { dataVersionFilter, DataVersionHandler } from '../handlers/data-version-handler';
import { FindHandler } from '../handlers/find-handler';
import { SoftDeleteHandler } from '../handlers/soft-delete-handler';
import { isDescendentOfCommonModel } from '../utils/descendent-of-common-model';
import { PolarisConnection } from './polaris-connection';
import { PolarisRepository } from './polaris-repository';
import { PolarisRepositoryFactory } from './polaris-repository-factory';
import { addDateRangeCriteria } from '../utils/query-builder-util';

export class PolarisEntityManager extends EntityManager {
    private static async setInfoOfCommonModel(
        context: PolarisGraphQLContext,
        maybeEntityOrOptions?: any,
    ) {
        if (maybeEntityOrOptions instanceof Array) {
            for (const t of maybeEntityOrOptions) {
                t.dataVersion = context?.returnedExtensions?.dataVersion;
                t.realityId = context?.requestHeaders?.realityId ?? 0;
                PolarisEntityManager.setUpnOfEntity(t, context);
            }
        } else if (maybeEntityOrOptions instanceof Object) {
            maybeEntityOrOptions.dataVersion = context?.returnedExtensions?.dataVersion;
            maybeEntityOrOptions.realityId = context?.requestHeaders?.realityId ?? 0;
            PolarisEntityManager.setUpnOfEntity(maybeEntityOrOptions, context);
        }
    }

    private static setUpnOfEntity(entity: any, context: PolarisGraphQLContext) {
        if (context?.requestHeaders) {
            const id = context?.requestHeaders?.upn || context?.requestHeaders?.requestingSystemId;
            if (entity.lastUpdateTime == null) {
                entity.createdBy = id;
            }
            entity.lastUpdatedBy = id;
        }
    }

    // @ts-ignore
    public connection: PolarisConnection;
    public dataVersionHandler: DataVersionHandler;
    public findHandler: FindHandler;
    public softDeleteHandler: SoftDeleteHandler;
    // @ts-ignore
    protected repositories: PolarisRepository<any>[];

    constructor(connection: PolarisConnection) {
        super((connection as unknown) as Connection);
        this.dataVersionHandler = new DataVersionHandler();
        this.findHandler = new FindHandler();
        this.softDeleteHandler = new SoftDeleteHandler();
    }

    // @ts-ignore
    public getRepository<Entity>(
        target: (new () => Entity) | Function | EntitySchema<Entity> | string,
    ): PolarisRepository<Entity> {
        // throw exception if there is no repository with this target registered
        if (!this.connection.hasMetadata(target as any)) {
            throw new RepositoryNotFoundError(this.connection.name, target);
        }
        // find already created repository instance and return it if found
        const metadata = this.connection.getMetadata(target as any);
        const repository: PolarisRepository<any> | undefined = this.repositories.find(
            (repo) => repo.metadata === metadata,
        );
        if (repository) {
            return repository;
        }
        // if repository was not found then create it, store its instance and return it
        const newRepository: PolarisRepository<any> = new PolarisRepositoryFactory().create(
            (this as unknown) as EntityManager,
            metadata,
            this.queryRunner,
        );
        this.repositories.push(newRepository);
        return newRepository;
    }

    public hasRepository<Entity>(
        target: (new () => Entity) | Function | EntitySchema<Entity> | string,
    ): boolean {
        return this.connection.hasMetadata(target as any);
    }

    public async delete<Entity>(
        targetOrEntity: any,
        criteria: PolarisCriteria | any,
    ): Promise<DeleteResult> {
        if (criteria instanceof PolarisCriteria) {
            return this.wrapTransaction(
                async (runner: QueryRunner) => {
                    const { context } = criteria;
                    await this.dataVersionHandler.updateDataVersion(
                        context,
                        this.connection,
                        runner,
                    );
                    if (this.connection.options.extra?.config?.allowSoftDelete === false) {
                        return runner.manager.delete(targetOrEntity, criteria.criteria);
                    }
                    return this.softDeleteHandler.softDeleteRecursive(
                        targetOrEntity,
                        criteria,
                        runner.manager,
                    );
                },
                criteria.context,
                true,
            );
        } else {
            return super.delete(targetOrEntity, criteria);
        }
    }

    public async findOne<Entity>(
        entityClass: any,
        criteria: PolarisFindOneOptions<Entity> | any,
        maybeOptions?: FindOneOptions<Entity>,
    ): Promise<Entity | undefined> {
        if (criteria instanceof PolarisFindOneOptions) {
            return this.wrapTransaction(
                async (runner: QueryRunner) => {
                    return (
                        await this.createQueryBuilder(
                            entityClass,
                            undefined,
                            runner,
                            this.findHandler.findConditions<Entity>(true, criteria),
                            criteria.context,
                            undefined,
                            criteria.context.entityDateRangeFilter,
                        )
                    ).getOne();
                },
                criteria.context,
                false,
            );
        } else {
            return super.findOne(entityClass, criteria, maybeOptions);
        }
    }

    public async find<Entity>(
        entityClass: any,
        criteria?: PolarisFindManyOptions<Entity> | any,
    ): Promise<Entity[]> {
        if (criteria instanceof PolarisFindManyOptions) {
            return this.wrapTransaction(
                async (runner: QueryRunner) => {
                    return (
                        await this.createQueryBuilder(
                            entityClass,
                            undefined,
                            runner,
                            this.findHandler.findConditions<Entity>(true, criteria),
                            criteria.context,
                            undefined,
                            criteria.context.entityDateRangeFilter,
                        )
                    ).getMany();
                },
                criteria.context,
                false,
            );
        } else {
            return super.find(entityClass, criteria);
        }
    }

    public async findSortedByDataVersion<Entity>(
        entityClass: any,
        criteria: PolarisFindManyOptions<Entity>,
    ): Promise<Entity[]> {
        if (criteria instanceof PolarisFindManyOptions) {
            return this.wrapTransaction(
                async (runner: QueryRunner) => {
                    const rawMany = await this.createQueryBuilder(
                        entityClass,
                        undefined,
                        runner,
                        this.findHandler.findConditions<Entity>(true, criteria),
                        criteria.context,
                        undefined,
                        criteria.context.entityDateRangeFilter,
                        true,
                    ).getRawMany();
                    const result = rawMany.map((entity) => {
                        const entityId = entity.id;
                        delete entity.id;
                        let dvs = Object.values(entity);
                        dvs = dvs.filter((dv) => dv != null);
                        const maxDV = Math.max(...(dvs as any));
                        return { entityId, maxDV };
                    });
                    result.sort((a, b) => {
                        const res = a.maxDV - b.maxDV;
                        return res === 0 ? a.entityId - b.entityId : res;
                    });
                    let ids = result.map((entity) => entity.entityId);
                    const pageSize = criteria.context.snapshotContext?.pageSize || 10;
                    const lastId = ids[ids.length - 1];
                    const lastIdInDV = criteria.context.requestHeaders.lastIdInDV;
                    const indexLastIdInDV = lastIdInDV != null ? ids.indexOf(lastIdInDV) + 1 : 0;
                    ids =
                        lastIdInDV != null
                            ? ids.slice(
                                  indexLastIdInDV,
                                  Math.min(indexLastIdInDV + pageSize, ids.length),
                              )
                            : ids.slice(0, Math.min(pageSize, ids.length));
                    const lastIdInPage = ids[ids.length - 1];
                    const lastDvInPage = result.find((entity) => entity.entityId === lastIdInPage)
                        ?.maxDV;
                    criteria.context.onlinePaginatedContext!.lastDataVersionInPage = lastDvInPage;
                    criteria.context.onlinePaginatedContext!.lastIdInPage = lastId;
                    criteria.context.onlinePaginatedContext!.isLastPage = lastId === lastDvInPage;
                    return super.findByIds(entityClass, ids, criteria.criteria);
                },
                criteria.context,
                false,
            );
        } else {
            return super.find(entityClass, criteria);
        }
    }
    public async count<Entity>(
        entityClass: any,
        criteria?: PolarisFindManyOptions<Entity> | any,
    ): Promise<number> {
        if (criteria instanceof PolarisFindManyOptions) {
            return this.wrapTransaction(
                async (runner: QueryRunner) => {
                    return (
                        await this.createQueryBuilder(
                            entityClass,
                            undefined,
                            runner,
                            this.findHandler.findConditions<Entity>(true, criteria),
                            criteria.context,
                            undefined,
                            criteria.context.entityDateRangeFilter,
                        )
                    ).getCount();
                },
                criteria.context,
                false,
            );
        } else {
            return super.count(entityClass, criteria);
        }
    }

    public async save<Entity, T extends DeepPartial<Entity>>(
        targetOrEntity: any,
        maybeEntityOrOptions?: PolarisSaveOptions<Entity, T> | any,
        maybeOptions?: any,
    ): Promise<T | T[]> {
        if (maybeEntityOrOptions instanceof PolarisSaveOptions) {
            return this.wrapTransaction(
                async (runner: QueryRunner) => {
                    const { context } = maybeEntityOrOptions;
                    await this.dataVersionHandler.updateDataVersion(
                        context,
                        this.connection,
                        runner,
                    );
                    await PolarisEntityManager.setInfoOfCommonModel(
                        context,
                        maybeEntityOrOptions.entities,
                    );
                    return runner.manager.save(
                        targetOrEntity,
                        maybeEntityOrOptions.entities,
                        maybeOptions,
                    );
                },
                maybeEntityOrOptions.context,
                true,
            );
        } else {
            return super.save(targetOrEntity, maybeEntityOrOptions, maybeOptions);
        }
    }

    public async update<Entity>(
        target: any,
        criteria: PolarisCriteria | any,
        partialEntity: any,
    ): Promise<UpdateResult> {
        if (criteria instanceof PolarisCriteria) {
            return this.wrapTransaction(
                async (runner: QueryRunner) => {
                    let updateCriteria: any;
                    const { context } = criteria;
                    await this.dataVersionHandler.updateDataVersion(
                        criteria.context,
                        this.connection,
                        runner,
                    );
                    const dataVersion = context.returnedExtensions.dataVersion;
                    const upnOrRequestingSystemId = context.requestHeaders
                        ? context.requestHeaders.upn || context.requestHeaders.requestingSystemId
                        : '';
                    partialEntity = {
                        ...partialEntity,
                        dataVersion,
                        lastUpdatedBy: upnOrRequestingSystemId,
                    };
                    delete partialEntity.realityId;
                    updateCriteria = criteria.criteria;

                    if (
                        this.connection.options.type === 'postgres' ||
                        this.connection.options.type === 'mssql'
                    ) {
                        return runner.manager.update(target, updateCriteria, partialEntity);
                    }

                    if (typeof updateCriteria === 'string' || updateCriteria instanceof Array) {
                        updateCriteria = {
                            where: {
                                id: In(
                                    updateCriteria instanceof Array
                                        ? updateCriteria
                                        : [updateCriteria],
                                ),
                            },
                        };
                    }

                    const entitiesToUpdate = await super.find(target, updateCriteria);
                    entitiesToUpdate.forEach((entityToUpdate: typeof target, index) => {
                        entitiesToUpdate[index] = { ...entityToUpdate, ...partialEntity };
                    });
                    await runner.manager.save(target, entitiesToUpdate);
                    const updateResult: UpdateResult = {
                        generatedMaps: [],
                        raw: entitiesToUpdate,
                        affected: entitiesToUpdate.length,
                    };
                    return updateResult;
                },
                criteria.context,
                true,
            );
        } else {
            return super.update(target, criteria, partialEntity);
        }
    }

    // @ts-ignore
    public createQueryBuilder<Entity>(
        entityClass?: Function | EntitySchema<any> | string,
        alias?: string,
        queryRunner?: QueryRunner,
        criteria?: any,
        context?: PolarisGraphQLContext,
        shouldIncludeDeletedEntities?: boolean,
        dateRangeFilter?: EntityFilter,
        findSorted?: boolean,
    ): SelectQueryBuilder<Entity> {
        if (!entityClass) {
            return super.createQueryBuilder();
        }
        const metadata = this.connection.getMetadata(entityClass);
        let qb = super.createQueryBuilder<Entity>(
            metadata.target as any,
            alias ?? metadata.tableName,
        );
        if (queryRunner) {
            qb.setQueryRunner(queryRunner);
        }
        if (context) {
            qb = dataVersionFilter(
                this.connection,
                qb,
                metadata.tableName,
                context,
                !shouldIncludeDeletedEntities,
                findSorted || false,
            );
            if (isDescendentOfCommonModel(metadata)) {
                criteria = this.findHandler.findConditions<Entity>(
                    true,
                    {
                        context,
                        criteria,
                    },
                    shouldIncludeDeletedEntities,
                );
            }
        }
        if (criteria?.where) {
            qb = qb.andWhere(criteria.where);
            delete criteria.where;
        }
        if (dateRangeFilter) {
            addDateRangeCriteria(qb, dateRangeFilter, metadata.tableName);
        }
        if (criteria && Object.keys(criteria).length === 0) {
            criteria = undefined;
        }
        if (
            !FindOptionsUtils.isFindManyOptions(criteria) ||
            criteria.loadEagerRelations !== false
        ) {
            FindOptionsUtils.joinEagerRelations(qb, qb.alias, metadata);
        }
        return FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(qb, criteria);
    }

    private async wrapTransaction(
        action: any,
        context: PolarisGraphQLContext,
        shouldStartTransaction: boolean,
    ) {
        const id = context?.requestHeaders?.requestId;
        const runnerCreatedByUs = !(id && this.connection.queryRunners.has(id));
        const runner = runnerCreatedByUs
            ? this.connection.createQueryRunner()
            : this.connection.queryRunners.get(id!)!;
        try {
            if (!runner.isTransactionActive && shouldStartTransaction) {
                await runner.startTransaction();
            }
            const result = await action(runner);
            if (runnerCreatedByUs && shouldStartTransaction) {
                await runner.commitTransaction();
            }
            return result;
        } catch (err) {
            if (runnerCreatedByUs && shouldStartTransaction) {
                await runner.rollbackTransaction();
            }
            this.connection.logger.log('log', err.message);
            throw err;
        } finally {
            // if we created the query runner, release it
            if (!runner.isReleased && runnerCreatedByUs) {
                await runner.release();
            }
        }
    }
}
