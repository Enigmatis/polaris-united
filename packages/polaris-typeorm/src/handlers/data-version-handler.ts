import { PolarisExtensions, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { Brackets, EntityMetadata } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { DataVersion, PolarisConnection, PolarisEntityManager, SelectQueryBuilder } from '..';
import { isDescendentOfCommonModel } from '../utils/descendent-of-common-model';
import { setWhereCondition } from '../utils/query-builder-util';
import { cloneDeep } from 'lodash';

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
    if (propertyRelations instanceof Array) {
        return propertyRelations.find((x: any) => x.has(relation.propertyName));
    } else {
        return propertyRelations.has(relation.propertyName) ? propertyRelations : undefined;
    }
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
        qb = setWhereCondition(
            qb,
            new Brackets((qb2) => {
                qb2.where(`${qb.alias}.dataVersion > :dataVersion`, { dataVersion });
                names = names.slice(1);
                for (const name of names) {
                    qb2 = qb2.orWhere(`${name}.dataVersion > :dataVersion`);
                }
            }),
        );
    }
    return qb;
}

export const leftJoinDataVersionFilter = (
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

export const InnerJoinDataVersionQuery = (
    connection: PolarisConnection,
    context: PolarisGraphQLContext,
    rootEntityMetadata: EntityMetadata,
): string => {
    const selectQueriesMap: Map<string, SelectQueryBuilder<any>> = createEntitiesSelectQueries(
        connection,
        rootEntityMetadata,
        context,
    );

    const rootEntityIdSelection = `"${rootEntityMetadata.tableName}"."id"`;
    return buildInnerJoinQuery([...selectQueriesMap.values()], rootEntityIdSelection);
};

function buildInnerJoinQuery(
    selectQueries: SelectQueryBuilder<any>[],
    rootEntityIdSelection: string,
): string {
    let finalQuery = 'WITH w1(id, dv) AS (';
    const union = ' UNION ';
    selectQueries.forEach((query: SelectQueryBuilder<any>) => {
        const splitQuery = query.getSql().split('SELECT');
        finalQuery = finalQuery.concat(`SELECT ${rootEntityIdSelection},`);
        finalQuery =
            selectQueries.indexOf(query) !== selectQueries.length - 1
                ? finalQuery.concat(splitQuery[1]).concat(union)
                : finalQuery.concat(splitQuery[1]);
    });
    finalQuery = finalQuery.concat(
        ') SELECT w1.id AS "entityId", MAX(w1.dv) AS "maxDV" FROM w1 GROUP BY w1.id ORDER BY "maxDV", "entityId"',
    );
    return finalQuery;
}

function createEntitiesSelectQueries(
    connection: PolarisConnection,
    rootEntityMetadata: EntityMetadata,
    context: PolarisGraphQLContext,
): Map<string, SelectQueryBuilder<any>> {
    const selectQueries: Map<string, SelectQueryBuilder<any>> = new Map();

    const rootEntitySelectQuery = getRootEntitySelectQuery(connection, rootEntityMetadata, context);
    selectQueries.set(rootEntityMetadata.tableName, rootEntitySelectQuery);

    createChildEntitiesSelectQueries(
        rootEntityMetadata,
        context,
        context.dataVersionContext!.mapping!,
        selectQueries,
        rootEntityMetadata.tableName,
    );

    return selectQueries;
}

function getRootEntitySelectQuery(
    connection: PolarisConnection,
    rootEntityMetadata: EntityMetadata,
    context: PolarisGraphQLContext,
): SelectQueryBuilder<any> {
    const rootEntityQueryBuilder = connection.createQueryBuilder();
    setWhereClauseOfQuery(rootEntityQueryBuilder, context, rootEntityMetadata);
    return rootEntityQueryBuilder
        .addSelect(`${rootEntityMetadata.tableName}.dataVersion`)
        .addFrom(rootEntityMetadata.tableName, rootEntityMetadata.tableName);
}

function createChildEntitiesSelectQueries(
    entityMetadata: EntityMetadata,
    context: PolarisGraphQLContext,
    mapping: Map<string, any>,
    selectQueries: Map<string, SelectQueryBuilder<any>>,
    currentEntityPath: string,
): void {
    if (entityMetadata.relations && mapping.size > 0) {
        for (const relation of entityMetadata.relations) {
            const childDVMapping = getChildDVMapping(mapping, relation, entityMetadata);
            if (childDVMapping) {
                const relationEntityMetadata = relation.inverseEntityMetadata;
                const parentSelectQuery = getParentSelectQuery(currentEntityPath, selectQueries);
                const relationQueryBuilder: SelectQueryBuilder<any> = cloneDeep(parentSelectQuery!);
                handleInnerJoinForRelation(
                    relationQueryBuilder,
                    relationEntityMetadata,
                    relation,
                    context,
                );
                const entityPath = `${currentEntityPath}.${relationEntityMetadata.tableName}`;
                selectQueries.set(entityPath, relationQueryBuilder);
                createChildEntitiesSelectQueries(
                    relationEntityMetadata,
                    context,
                    childDVMapping,
                    selectQueries,
                    entityPath,
                );
            }
        }
    }
}

function handleInnerJoinForRelation(
    queryBuilder: SelectQueryBuilder<any>,
    entityMetadata: EntityMetadata,
    relation: RelationMetadata,
    context: PolarisGraphQLContext,
) {
    setWhereClauseOfQuery(queryBuilder, context, entityMetadata);
    if (relation.relationType === 'one-to-many' || relation.relationType === 'many-to-one') {
        handleInnerJoinForOneToManyRelation(queryBuilder, entityMetadata, relation);
    } else if (relation.relationType === 'many-to-many') {
        handleInnerJoinForManyToManyRelation(queryBuilder, entityMetadata, relation);
    } else {
        handleInnerJoinForOneToOneRelation(queryBuilder, entityMetadata, relation);
    }
}

function handleInnerJoinForOneToManyRelation(
    queryBuilder: SelectQueryBuilder<any>,
    entityMetadata: EntityMetadata,
    relation: RelationMetadata,
) {
    const condition = getInnerJoinConditionByRelationType(relation);
    queryBuilder
        .select(`${entityMetadata.tableName}.dataVersion`)
        .innerJoin(entityMetadata.target, entityMetadata.tableName, condition[0] || '');
}

function handleInnerJoinForManyToManyRelation(
    queryBuilder: SelectQueryBuilder<any>,
    entityMetadata: EntityMetadata,
    relation: RelationMetadata,
) {
    const innerJoinsConditions: string[] = getInnerJoinConditionByRelationType(relation);
    if (innerJoinsConditions.length === 2) {
        queryBuilder
            .select(`${entityMetadata.tableName}.dataVersion`)
            .innerJoin(
                relation.junctionEntityMetadata!.tableName,
                relation.junctionEntityMetadata!.tableName,
                innerJoinsConditions[0],
            )
            .innerJoin(entityMetadata.target, entityMetadata.tableName, innerJoinsConditions[1]);
    }
}

function handleInnerJoinForOneToOneRelation(
    queryBuilder: SelectQueryBuilder<any>,
    entityMetadata: EntityMetadata,
    relation: RelationMetadata,
) {
    const condition = getInnerJoinConditionByRelationType(relation);
    queryBuilder
        .select(`${entityMetadata.tableName}.dataVersion`)
        .innerJoin(entityMetadata.target, entityMetadata.tableName, condition[0]);
}

function getManyToManyInnerJoinConditions(relation: RelationMetadata): string[] {
    const conditions: string[] = [];

    const parentCondition = getInnerJoinConditionByEntityMetadata(
        relation,
        relation.entityMetadata,
    );
    if (parentCondition) {
        conditions.push(parentCondition);
    }
    const childCondition = getInnerJoinConditionByEntityMetadata(
        relation,
        relation.inverseEntityMetadata,
    );
    if (childCondition) {
        conditions.push(childCondition);
    }

    return conditions;
}

function getInnerJoinConditionByEntityMetadata(
    relation: RelationMetadata,
    entityMetadata: EntityMetadata,
) {
    const joinTableEntityColumn = relation.junctionEntityMetadata!.columns.find((column) =>
        column.databaseName.includes(entityMetadata.tableName),
    );
    const idColumnName = getIdColumnName(relation, entityMetadata);
    if (idColumnName) {
        return `${relation.junctionEntityMetadata!.tableName}.${
            joinTableEntityColumn?.databaseName
        } = ${entityMetadata.tableName}.${idColumnName}`;
    }
}

function setWhereClauseOfQuery(
    queryBuilder: SelectQueryBuilder<any>,
    context: PolarisGraphQLContext,
    entityMetadata: EntityMetadata,
) {
    let dataVersionThreshold = context.requestHeaders.dataVersion || 0;
    if (context.requestHeaders.lastIdInDV) {
        dataVersionThreshold--;
    }
    const realityIdThreshold = context.requestHeaders.realityId || 0;
    queryBuilder.where(`${entityMetadata.tableName}.dataVersion > ${dataVersionThreshold}`);
    queryBuilder.andWhere(`${entityMetadata.tableName}.realityId = ${realityIdThreshold}`);
    queryBuilder.andWhere(`${entityMetadata.tableName}.deleted = false`);
}

function getChildDVMapping(
    mapping: Map<string, any>,
    relation: RelationMetadata,
    entityMetadata: EntityMetadata,
) {
    const children = extractRelations(mapping, entityMetadata, relation);
    return children ? getPropertyMap(children, relation) : undefined;
}

function getParentSelectQuery(
    currentEntityPath: string,
    selectQueries: Map<string, SelectQueryBuilder<any>>,
): SelectQueryBuilder<any> | undefined {
    return selectQueries.get(currentEntityPath);
}

function getInnerJoinConditionByRelationType(relation: RelationMetadata): string[] {
    if (relation.relationType === 'one-to-many' || relation.relationType === 'many-to-one') {
        return getInnerJoinCondition(relation);
    } else if (relation.relationType === 'many-to-many') {
        return getManyToManyInnerJoinConditions(relation);
    } else {
        return getOneToOneInnerJoinCondition(relation);
    }
}

function getOneToOneInnerJoinCondition(relation: RelationMetadata): string[] {
    return relation.isOwning
        ? [
              `${relation.entityMetadata.tableName}.${relation.foreignKeys[0].columnNames[0]} = ${relation.inverseEntityMetadata.tableName}.${relation.foreignKeys[0].referencedColumnNames[0]}`,
          ]
        : getInnerJoinCondition(relation);
}

function getInnerJoinCondition(relation: RelationMetadata): string[] {
    const condition: string[] = [];
    const parentIdColumnName = getIdColumnName(relation, relation.entityMetadata);
    if (parentIdColumnName) {
        const childReferencedColumnName = getChildReferencedColumnName(
            relation.inverseEntityMetadata,
            relation.entityMetadata.tableName,
        );
        condition.push(
            `${relation.entityMetadata.tableName}.${parentIdColumnName}=${relation.inverseEntityMetadata.tableName}.${childReferencedColumnName}`,
        );
    }
    return condition;
}

function getChildReferencedColumnName(entityMetadata: EntityMetadata, parentTableName: string) {
    const parentReferencedColumn = entityMetadata.columns.find((column) =>
        column.databaseName.includes(parentTableName),
    );
    if (parentReferencedColumn) {
        return parentReferencedColumn.databaseName;
    }
}

function getIdColumnName(
    relation: RelationMetadata,
    entityMetadata: EntityMetadata,
): string | undefined {
    if (
        relation.relationType === 'one-to-many' ||
        relation.relationType === 'many-to-one' ||
        relation.relationType === 'one-to-one'
    ) {
        const referencedColumn = relation.inverseEntityMetadata.columns.find(
            (column) =>
                column.referencedColumn !== undefined &&
                column.databaseName.includes(entityMetadata.tableName),
        );
        const splitPath = referencedColumn!.propertyPath.split('.');
        return splitPath[splitPath.length - 1];
    } else if (relation.relationType === 'many-to-many') {
        const entityJoinTableForeignKey = relation.junctionEntityMetadata!.foreignKeys.find(
            (foreignKey) =>
                foreignKey.referencedEntityMetadata.tableName === entityMetadata.tableName,
        );
        return entityJoinTableForeignKey?.referencedColumnNames[0];
    }
}
