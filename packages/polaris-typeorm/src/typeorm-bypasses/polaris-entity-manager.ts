import {
    PolarisGraphQLContext,
    isMutation,
    NotificationCenterAlertType,
} from '@enigmatis/polaris-common';
import {
    Connection,
    DeepPartial,
    DeleteResult,
    EntityManager,
    EntityMetadata,
    EntitySchema,
    EntityTarget,
    FindManyOptions,
    FindOneOptions,
    FindOptionsUtils,
    In,
    QueryRunner,
    SaveOptions,
    SelectQueryBuilder,
    UpdateResult,
} from 'typeorm';
import { RepositoryNotFoundError } from 'typeorm/error/RepositoryNotFoundError';
import {
    leftJoinDataVersionFilter,
    DataVersionHandler,
    InnerJoinDataVersionQuery,
} from '../handlers/data-version-handler';
import { FindHandler } from '../handlers/find-handler';
import { SoftDeleteHandler } from '../handlers/soft-delete-handler';
import { isDescendentOfCommonModel } from '../utils/descendent-of-common-model';
import { PolarisConnection } from './polaris-connection';
import { PolarisRepository } from './polaris-repository';
import { PolarisRepositoryFactory } from './polaris-repository-factory';
import { addDateRangeCriteria } from '../utils/query-builder-util';
import { CommonModelSubscriber } from '../subscribers/common-model-subscriber';

export class PolarisEntityManager extends EntityManager {
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
    public context?: PolarisGraphQLContext;

    constructor(
        connection: PolarisConnection,
        queryRunner?: QueryRunner,
        context?: PolarisGraphQLContext,
    ) {
        super((connection as unknown) as Connection, queryRunner);
        this.dataVersionHandler = new DataVersionHandler();
        this.findHandler = new FindHandler();
        this.softDeleteHandler = new SoftDeleteHandler();
        this.context = context;
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
        criteria: string | string[] | any,
    ): Promise<DeleteResult> {
        await this.startTransaction();
        if (
            isDescendentOfCommonModel(this.connection.getMetadata(targetOrEntity)) &&
            this.context
        ) {
            await this.dataVersionHandler.updateDataVersion(this.connection, this);

            let deleteCriteria = criteria;
            if (typeof deleteCriteria === 'string' || deleteCriteria instanceof Array) {
                deleteCriteria = {
                    where: {
                        id: In(deleteCriteria instanceof Array ? deleteCriteria : [deleteCriteria]),
                    },
                };
            }

            if (this.connection.options.extra?.config?.allowSoftDelete === false) {
                return this.connection.manager
                    .createQueryBuilder()
                    .delete()
                    .from(targetOrEntity.name)
                    .where(deleteCriteria)
                    .returning('id')
                    .execute()
                    .then((res: DeleteResult) => {
                        CommonModelSubscriber.handleDeleteAndUpdateEvents(
                            targetOrEntity.name.toLowerCase(),
                            res.raw,
                            this.context?.requestHeaders.realityId || 0,
                            NotificationCenterAlertType.HARD_DELETE,
                        );
                        return res;
                    });
            }
            return this.softDeleteHandler.softDeleteRecursive(
                targetOrEntity,
                criteria,
                this as any,
            );
        } else {
            return super.delete(targetOrEntity, criteria);
        }
    }

    public async findOne<Entity>(
        entityClass: EntityTarget<Entity>,
        criteria: FindOneOptions<Entity> | any,
        maybeOptions?: FindOneOptions<Entity>,
    ): Promise<Entity | undefined> {
        await this.startTransaction();
        const metadata = this.connection.getMetadata(entityClass);
        if (isDescendentOfCommonModel(metadata) && this.context) {
            criteria = this.findHandler.findConditions<Entity>(true, this.context, criteria);
        }
        return super.findOne(entityClass, criteria, maybeOptions);
    }

    public async find<Entity>(
        entityClass: EntityTarget<Entity>,
        criteria?: FindManyOptions<Entity> | any,
    ): Promise<Entity[]> {
        await this.startTransaction();
        const metadata = this.connection.getMetadata(entityClass);
        if (isDescendentOfCommonModel(metadata) && this.context) {
            return this.createQueryBuilderWithPolarisConditions(
                entityClass,
                metadata.name,
                criteria,
            ).getMany();
        }
        return super.find(entityClass, criteria);
    }

    public async findByIds<Entity>(
        entityClass: any,
        ids: any[],
        criteria?: FindManyOptions<Entity> | any,
    ): Promise<Entity[]> {
        await this.startTransaction();
        return super.findByIds(entityClass, ids, criteria);
    }

    public async findWithLeftJoinSortedByDataVersion<Entity>(
        entityClass: EntityTarget<Entity>,
        criteria?: FindManyOptions<Entity>,
    ): Promise<Entity[]> {
        await this.startTransaction();
        const metadata = this.connection.getMetadata(entityClass);
        if (isDescendentOfCommonModel(metadata) && this.context) {
            const rawMany = await this.createQueryBuilderWithPolarisConditions(
                entityClass,
                metadata.name,
                criteria,
                undefined,
                true,
            ).getRawMany();
            const result: { id: string; maxdv: number }[] = this.getIdsAndTheirMaxDvs(
                rawMany,
                (entityClass as any).name,
            );
            const { ids, lastId } = this.getSortedIdsToReturnByPageSize(result);
            this.updateOnlinePaginatedContext(ids, result, lastId);
            return this.findByIds(entityClass, ids, criteria);
        } else {
            return super.find(entityClass, criteria);
        }
    }

    public async findWithInnerJoinSortedByDataVersion<Entity>(
        entityClass: EntityTarget<Entity>,
        criteria?: FindManyOptions<Entity>,
    ): Promise<Entity[]> {
        await this.startTransaction();
        const metadata = this.connection.getMetadata(entityClass);
        if (isDescendentOfCommonModel(metadata) && this.context) {
            const innerJoinQuery = InnerJoinDataVersionQuery(
                this.connection,
                this.context,
                metadata,
            );
            const result = await this.connection.manager.query(innerJoinQuery!);
            const { ids, lastId } = this.getSortedIdsToReturnByPageSize(result);
            this.updateOnlinePaginatedContext(ids, result, lastId);
            return this.findByIds(entityClass, ids, criteria);
        } else {
            return super.find(entityClass, criteria);
        }
    }

    private async setInfoOfCommonModelRecursive(
        context: PolarisGraphQLContext,
        entityMetadata: EntityMetadata,
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

        if (entityMetadata && entityMetadata.relations) {
            for (const relation of entityMetadata.relations) {
                const relationMetadata = relation.inverseEntityMetadata;
                const isCascadeInsert = relation.isCascadeInsert;
                if (isDescendentOfCommonModel(relationMetadata) && isCascadeInsert) {
                    await this.setInfoOfCommonModelRecursive(
                        context,
                        relationMetadata,
                        maybeEntityOrOptions[relation.propertyName],
                    );
                }
            }
        }
    }

    private getSortedIdsToReturnByPageSize(result: { id: string; maxdv: number }[]) {
        this.sortEntities(result);
        let ids = result.map((entity) => entity.id);
        const pageSize = this.context?.onlinePaginatedContext?.pageSize!;
        const lastId = ids[ids.length - 1];
        const lastIdInDV = this.context?.requestHeaders.lastIdInDV;
        const indexLastIdInDV = lastIdInDV != null ? ids.indexOf(lastIdInDV) + 1 : 0;
        ids = ids.slice(indexLastIdInDV, Math.min(indexLastIdInDV + pageSize, ids.length));
        return { ids, lastId };
    }

    private sortEntities(result: { id: string; maxdv: number }[]) {
        result.sort((a, b) => {
            const res = a.maxdv - b.maxdv;
            return res === 0 ? a.id.localeCompare(b.id) : res;
        });
    }

    private updateOnlinePaginatedContext<Entity>(
        ids: string[],
        result: { id: string; maxdv: number }[],
        lastId: string,
    ) {
        const lastIdInPage = ids[ids.length - 1];
        const lastDataVersionInPage = result.find((entity) => entity.id === lastIdInPage)?.maxdv;
        if (this.context) {
            this.context.onlinePaginatedContext = {
                ...this.context.onlinePaginatedContext,
                lastDataVersionInPage,
                lastIdInPage,
                isLastPage: lastId === lastIdInPage,
            };
        }
    }

    private getIdsAndTheirMaxDvs(rawMany: any, entityIdFieldName: string) {
        if (rawMany && rawMany.length && rawMany[0].maxDV) {
            return rawMany;
        }
        return rawMany.map((entity: any) => {
            const id = entity[entityIdFieldName];
            delete entity[entityIdFieldName];
            let dvs = Object.values(entity);
            dvs = dvs.filter((dv) => dv != null);
            const maxdv = Math.max(...(dvs as any));
            return { id, maxdv };
        });
    }

    public async count<Entity>(
        entityClass: any,
        criteria?: FindManyOptions<Entity> | any,
    ): Promise<number> {
        await this.startTransaction();
        const metadata = this.connection.getMetadata(entityClass);
        if (isDescendentOfCommonModel(metadata) && this.context) {
            return this.createQueryBuilderWithPolarisConditions(
                entityClass,
                metadata.name,
                criteria,
            ).getCount();
        }
        return super.count(entityClass, criteria);
    }

    public async save<Entity, T extends DeepPartial<Entity>>(
        targetOrEntity: any,
        maybeEntityOrOptions?: SaveOptions | any,
        maybeOptions?: any,
    ): Promise<T | T[]> {
        await this.startTransaction();
        const metadata = this.connection.getMetadata(targetOrEntity);
        if (isDescendentOfCommonModel(metadata) && this.context) {
            await this.dataVersionHandler.updateDataVersion(this.connection, this);
            await this.setInfoOfCommonModelRecursive(this.context, metadata, maybeEntityOrOptions);
            return super.save(targetOrEntity, maybeEntityOrOptions, maybeOptions);
        } else {
            return super.save(targetOrEntity, maybeEntityOrOptions, maybeOptions);
        }
    }

    public async update<Entity>(
        target: any,
        criteria: string | string[] | any,
        partialEntity: any,
    ): Promise<UpdateResult> {
        await this.startTransaction();
        const metadata = this.connection.getMetadata(target);
        if (isDescendentOfCommonModel(metadata) && this.context) {
            await this.dataVersionHandler.updateDataVersion(this.connection, this);
            const dataVersion = this.context.returnedExtensions.dataVersion;
            const upnOrRequestingSystemId = this.context.requestHeaders
                ? this.context.requestHeaders.upn || this.context.requestHeaders.requestingSystemId
                : '';
            partialEntity = {
                ...partialEntity,
                dataVersion,
                lastUpdatedBy: upnOrRequestingSystemId,
            };
            delete partialEntity.realityId;

            let updateCriteria = criteria;
            if (typeof updateCriteria === 'string' || updateCriteria instanceof Array) {
                updateCriteria = {
                    where: {
                        id: In(updateCriteria instanceof Array ? updateCriteria : [updateCriteria]),
                    },
                };
            }

            if (
                this.connection.options.type === 'postgres' ||
                this.connection.options.type === 'mssql'
            ) {
                return this.connection.manager
                    .createQueryBuilder()
                    .update(target)
                    .set(partialEntity)
                    .where(updateCriteria)
                    .returning('id')
                    .execute()
                    .then((res: UpdateResult) => {
                        CommonModelSubscriber.handleDeleteAndUpdateEvents(
                            target.name.toLowerCase(),
                            res.raw,
                            this.context?.requestHeaders.realityId || 0,
                            NotificationCenterAlertType.UPDATE,
                        );
                        return res;
                    });
            }

            const entitiesToUpdate = await super.find(target, criteria);
            entitiesToUpdate.forEach((entityToUpdate: typeof target, index) => {
                entitiesToUpdate[index] = { ...entityToUpdate, ...partialEntity };
            });
            await super.save(target, entitiesToUpdate);
            const updateResult: UpdateResult = {
                generatedMaps: [],
                raw: entitiesToUpdate,
                affected: entitiesToUpdate.length,
            };
            return updateResult;
        } else {
            return super.update(target, criteria, partialEntity);
        }
    }

    public createQueryBuilderWithPolarisConditions<Entity>(
        entityClass: EntityTarget<Entity>,
        alias: string,
        criteria?: any,
        shouldIncludeDeletedEntities?: boolean,
        findSorted?: boolean,
    ) {
        let qb: SelectQueryBuilder<Entity> = this.connection.createQueryBuilder(
            entityClass as EntityTarget<Entity>,
            alias,
            this.queryRunner,
        );
        const metadata = this.connection.getMetadata(entityClass as EntityTarget<Entity>);
        let criteriaToSend: any = { ...criteria };
        if (this.context) {
            qb = leftJoinDataVersionFilter(
                this.connection,
                qb,
                metadata.name,
                this.context,
                !shouldIncludeDeletedEntities,
                findSorted || false,
            );
            if (isDescendentOfCommonModel(metadata)) {
                criteriaToSend = this.findHandler.findConditions<Entity>(
                    true,
                    this.context,
                    criteria,
                    shouldIncludeDeletedEntities,
                );
            }
        }
        if (findSorted) {
            delete criteriaToSend.relations;
        }
        if (criteriaToSend?.where) {
            qb = qb.andWhere(criteriaToSend.where);
            delete criteriaToSend.where;
        }
        const dateRangeFilter = this.context?.entityDateRangeFilter;
        if (dateRangeFilter) {
            addDateRangeCriteria(qb, dateRangeFilter, metadata.name);
        }
        if (criteriaToSend && Object.keys(criteriaToSend).length === 0) {
            criteriaToSend = undefined;
        }
        if (
            !FindOptionsUtils.isFindManyOptions(criteriaToSend) ||
            criteriaToSend?.loadEagerRelations !== false
        ) {
            FindOptionsUtils.joinEagerRelations(qb, qb.alias, metadata);
        }
        return FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(qb, criteriaToSend);
    }

    public async startTransaction() {
        try {
            if (!this.queryRunner?.isTransactionActive) {
                if (this.context?.request?.query) {
                    if (!isMutation(this.context?.request?.query)) {
                        await this.queryRunner?.startTransaction('SERIALIZABLE');
                        await this.queryRunner?.query('SET TRANSACTION READ ONLY');
                    } else {
                        await this.queryRunner?.startTransaction();
                    }
                }
            }
        } catch (err) {
            this.connection.logger.log('log', err.message);
            throw err;
        }
    }
}
