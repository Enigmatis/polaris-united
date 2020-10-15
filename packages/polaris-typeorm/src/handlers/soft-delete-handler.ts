import { EntityManager, In, UpdateResult } from 'typeorm';
import { CommonModel, PolarisCriteria } from '..';

export class SoftDeleteHandler {
    public async softDeleteRecursive(
        targetOrEntity: any,
        polarisCriteria: PolarisCriteria,
        manager: EntityManager,
    ): Promise<UpdateResult> {
        const softDeletedEntities = await this.updateWithReturningIds(
            targetOrEntity,
            polarisCriteria.criteria,
            {
                dataVersion: polarisCriteria?.context?.returnedExtensions?.globalDataVersion,
                deleted: true,
                lastUpdatedBy:
                    polarisCriteria?.context?.requestHeaders?.upn ||
                    polarisCriteria?.context?.requestHeaders?.requestingSystemName,
            },
            manager,
        );
        if (softDeletedEntities.affected === 0) {
            return softDeletedEntities;
        }
        const metadata = manager.connection.getMetadata(targetOrEntity);
        if (metadata && metadata.relations) {
            for (const relation of metadata.relations) {
                const relationMetadata = relation.inverseEntityMetadata;
                const hasCascadeDeleteFields =
                    relationMetadata.foreignKeys.filter(
                        (foreign) =>
                            foreign.onDelete === 'CASCADE' &&
                            foreign.referencedEntityMetadata === metadata,
                    ).length > 0;
                const isCommonModel =
                    relationMetadata.inheritanceTree.find(
                        (ancestor) => ancestor.name === 'CommonModel',
                    ) !== undefined;
                if (isCommonModel && hasCascadeDeleteFields) {
                    const x: { [key: string]: any } = {};
                    x[relation.inverseSidePropertyPath] = In(
                        softDeletedEntities.raw.map((row: { id: string }) => row.id),
                    );
                    await this.softDeleteRecursive(
                        relationMetadata.targetName,
                        new PolarisCriteria(x, polarisCriteria.context),
                        manager,
                    );
                }
            }
        }

        return softDeletedEntities;
    }

    private async updateWithReturningIds(
        target: any,
        criteria: string | string[] | any,
        partialEntity: any,
        manager: EntityManager,
    ) {
        // if user passed empty criteria or empty list of criterias, then throw an error
        if (
            criteria === undefined ||
            criteria === null ||
            criteria === '' ||
            (criteria instanceof Array && criteria.length === 0)
        ) {
            return Promise.reject(
                new Error(`Empty criteria(s) are not allowed for the delete method.`),
            );
        }

        if (
            manager.connection.options.type !== 'postgres' &&
            manager.connection.options.type !== 'mssql'
        ) {
            return this.updateWithFindAndSave(target, criteria, partialEntity, manager);
        } else {
            if (typeof criteria === 'string' || criteria instanceof Array) {
                return manager
                    .createQueryBuilder()
                    .update(target)
                    .set(partialEntity)
                    .whereInIds(criteria)
                    .returning('id')
                    .execute();
            } else {
                return manager
                    .createQueryBuilder()
                    .update(target)
                    .set(partialEntity)
                    .where(criteria)
                    .returning('id')
                    .execute();
            }
        }
    }

    private async updateWithFindAndSave(
        target: any,
        criteria: string | string[] | any,
        partialEntity: any,
        manager: EntityManager,
    ) {
        let findCriteria;
        if (typeof criteria === 'string' || criteria instanceof Array) {
            findCriteria = {
                deleted: false,
                id: In(criteria instanceof Array ? criteria : [criteria]),
            };
        } else {
            findCriteria = { deleted: false, ...criteria };
        }
        const entitiesToDelete = await manager.find(target, { where: findCriteria });
        entitiesToDelete.forEach((entity: typeof target, index: number) => {
            entitiesToDelete[index] = { ...entity, ...partialEntity };
        });
        await manager.save(target, entitiesToDelete);
        const updateResult = new UpdateResult();
        updateResult.affected = entitiesToDelete.length;
        updateResult.raw = entitiesToDelete;
        return updateResult;
    }
}
