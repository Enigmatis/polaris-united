import { PolarisExtensions, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { EntityMetadata } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { DataVersion, PolarisConnection, PolarisEntityManager, SelectQueryBuilder } from '..';
import { isDescendentOfCommonModel } from '../utils/descendent-of-common-model';

export class DataVersionHandler {
    public async updateDataVersion<Entity>(
        connection: PolarisConnection,
        manager: PolarisEntityManager,
    ) {
        const extensions: PolarisExtensions =
            (manager.context && manager.context.returnedExtensions) || ({} as PolarisExtensions);
        connection.logger.log('log', 'Started data version job when inserting/updating entity');
        const result = extensions.dataVersion
            ? { value: extensions.dataVersion }
            : await this.selectDataVersionForUpdate(manager, connection);
        if (!result) {
            if (extensions.dataVersion) {
                throw new Error(
                    'data version in context even though the data version table is empty',
                );
            }
            connection.logger.log('log', 'no data version found');
            await manager.save(DataVersion, new DataVersion(1));
            connection.logger.log('log', 'data version created');
            extensions.dataVersion = 2;
        } else {
            if (!extensions.dataVersion) {
                connection.logger.log('log', 'context does not hold data version');
                extensions.dataVersion = result.value + 1;
                await manager.increment(DataVersion, {}, 'value', 1);
                connection.logger.log('log', 'data version is incremented and holds new value');
            }
        }
        if (manager.context && extensions) {
            manager.context.returnedExtensions = extensions;
        }
        connection.logger.log('log', 'Finished data version job when inserting/updating entity');
    }
    private async selectDataVersionForUpdate(
        manager: PolarisEntityManager,
        connection: PolarisConnection,
    ): Promise<{ id: number; value: number } | undefined> {
        try {
            return manager
                .createQueryBuilder()
                .from(DataVersion, 'dv')
                .useTransaction(true)
                .setLock('pessimistic_write')
                .getRawOne();
        } catch (e) {
            connection.logger.log('warn', e);
            throw e;
        }
    }
}

const extractRelations = (
    dvMapping: Map<any, any>,
    entityMetadata: EntityMetadata,
    relation: RelationMetadata,
) => {
    let children;
    if (dvMapping.size > 1) {
        if (dvMapping.has(entityMetadata.name)) {
            children = dvMapping.get(entityMetadata.name);
        } else {
            if (dvMapping.has(relation.inverseSidePropertyPath)) {
                children = dvMapping.get(relation.inverseSidePropertyPath);
            }
        }
    } else {
        children = dvMapping.entries().next().value[1];
    }
    return children;
};

function getPropertyMap(propertyRelations: any | any[], relation: RelationMetadata) {
    return propertyRelations instanceof Array
        ? propertyRelations.find((x: any) => x.has(relation.propertyName))
        : propertyRelations.has(relation.propertyName)
        ? propertyRelations
        : undefined;
}

function getQbWithSelect(
    qb: any,
    entityMetadata: EntityMetadata,
    relation: RelationMetadata,
    alias: string,
    selectAll: boolean,
) {
    return selectAll
        ? qb.leftJoinAndSelect(`${entityMetadata.name}.${relation.propertyName}`, alias)
        : qb
              .leftJoin(`${entityMetadata.name}.${relation.propertyName}`, alias)
              .addSelect(`${alias}.dataVersion`);
}

function leftJoinRelationsToQB(
    children: any,
    relation: RelationMetadata,
    names: string[],
    qb: any,
    entityMetadata: EntityMetadata,
    selectAll: boolean,
) {
    const childDVMapping = getPropertyMap(children, relation);
    if (childDVMapping) {
        const relationMetadata = relation.inverseEntityMetadata;
        const alias: string = relationMetadata.name;
        const notInJoins = names.filter((x) => x === alias).length === 0;
        if (isDescendentOfCommonModel(relationMetadata) && notInJoins) {
            qb = getQbWithSelect(qb, entityMetadata, relation, alias, selectAll);
            names.push(alias);
            qb = loadRelations(qb, relationMetadata, names, childDVMapping, selectAll);
        }
    }
    return qb;
}

const loadRelations = (
    qb: any,
    entityMetadata: EntityMetadata,
    names: string[],
    dvMapping: Map<any, any>,
    selectAll: boolean,
): any => {
    if (entityMetadata.relations && dvMapping.size > 0) {
        for (const relation of entityMetadata.relations) {
            const children = extractRelations(dvMapping, entityMetadata, relation);
            if (children) {
                qb = leftJoinRelationsToQB(
                    children,
                    relation,
                    names,
                    qb,
                    entityMetadata,
                    selectAll,
                );
            }
        }
    }
    return qb;
};

function joinDataVersionRelations(
    context: PolarisGraphQLContext,
    shouldLoadRelations: boolean,
    findSorted: boolean,
    qb: SelectQueryBuilder<any>,
    entityName: string,
    entityMetadata: EntityMetadata,
    names: string[],
): SelectQueryBuilder<any> {
    let entityIdAlias = entityMetadata.name;
    if (findSorted) {
        qb.select(`${entityIdAlias}.id`, entityIdAlias);
    }
    if (context.dataVersionContext?.mapping && shouldLoadRelations) {
        qb = loadRelations(
            qb,
            entityMetadata,
            names,
            context.dataVersionContext!.mapping!,
            !findSorted,
        );
    }
    if (qb.expressionMap.selects.length <= 1 && findSorted) {
        entityIdAlias = 'entityId';
        qb.select(`${entityName}.id`, entityIdAlias);
    }
    if (findSorted) {
        qb.addSelect(
            `${entityName}.dataVersion`,
            qb.expressionMap.selects.length > 1 ? undefined : 'maxDV',
        );
    }
    return qb;
}

function applyDataVersionWhereConditions(
    context: PolarisGraphQLContext,
    qb: SelectQueryBuilder<any>,
    names: string[],
): SelectQueryBuilder<any> {
    let dataVersion = context.requestHeaders.dataVersion || 0;
    const lastIdInDataVersion = context.requestHeaders.lastIdInDV;
    if (lastIdInDataVersion) {
        dataVersion--;
    }
    if (dataVersion > 0) {
        qb.where(`${qb.alias}.dataVersion > :dataVersion`, { dataVersion });
        names = names.slice(1);
        for (const name of names) {
            qb = qb.orWhere(`${name}.dataVersion > :dataVersion`);
        }
    }
    return qb;
}

export const dataVersionFilter = (
    connection: PolarisConnection,
    qb: SelectQueryBuilder<any>,
    entityName: string,
    context: PolarisGraphQLContext,
    shouldLoadRelations: boolean,
    findSorted: boolean,
) => {
    if (
        (context.requestHeaders.dataVersion && context.requestHeaders.dataVersion > 0) ||
        findSorted
    ) {
        qb = qb.distinct();
        const entityMetadata = connection.getMetadata(entityName);
        const names: string[] = [entityName];
        qb = joinDataVersionRelations(
            context,
            shouldLoadRelations,
            findSorted,
            qb,
            entityName,
            entityMetadata,
            names,
        );
        return applyDataVersionWhereConditions(context, qb, names);
    }
    return qb;
};
