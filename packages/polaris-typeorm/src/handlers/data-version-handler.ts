import { PolarisExtensions, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { Brackets, EntityMetadata, QueryRunner, EntityTarget } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { DataVersion, PolarisConnection, PolarisEntityManager, SelectQueryBuilder } from '..';
import { isDescendentOfCommonModel } from '../utils/descendent-of-common-model';
import { createOrWhereCondition, setWhereCondition } from '../utils/query-builder-util';
import { cloneDeep } from 'lodash';
import { FindHandler } from './find-handler';

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

function getOrDataVersionCondition(
    queryBuilder: SelectQueryBuilder<any>,
    dataVersion: number,
    names: string[],
): Brackets {
    const whereConditions: string[] = [];
    whereConditions.push(`${queryBuilder.alias}.dataVersion > :dataVersion`);
    for (let i = 1; i < names.length; i++) {
        whereConditions.push(`${names[i]}.dataVersion > :dataVersion`);
    }
    return createOrWhereCondition({ where: whereConditions }, { dataVersion });
}

function applyDataVersionWhereConditions(
    context: PolarisGraphQLContext,
    qb: SelectQueryBuilder<any>,
    names: string[],
): void {
    let dataVersion = context.requestHeaders.dataVersion || 0;
    const lastIdInDataVersion = context.requestHeaders.lastIdInDV;
    if (lastIdInDataVersion) {
        dataVersion--;
    }
    if (dataVersion > 0) {
        setWhereCondition(qb, getOrDataVersionCondition(qb, dataVersion, names));
    }
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
        qb.distinct();
        const entityMetadata = connection.getMetadata(entityName);
        const names: string[] = [entityName];
        joinDataVersionRelations(
            context,
            shouldLoadRelations,
            findSorted,
            qb,
            entityName,
            entityMetadata,
            names,
        );
        applyDataVersionWhereConditions(context, qb, names);
    }
};

export const InnerJoinDataVersionQuery = (
    connection: PolarisConnection,
    context: PolarisGraphQLContext,
    rootEntityMetadata: EntityMetadata,
    criteria: any,
    entityClass: EntityTarget<any>,
    queryRunner?: QueryRunner,
): { query: string; parameters: any[] } => {
    const selectQueriesMap: Map<string, SelectQueryBuilder<any>> = createEntitiesSelectQueries(
        connection,
        rootEntityMetadata,
        context,
        criteria,
        entityClass,
        queryRunner,
    );

    const rootEntityIdSelection = `"${rootEntityMetadata.tableName}"."id"`;
    return buildInnerJoinQuery([...selectQueriesMap.values()], rootEntityIdSelection);
};

function buildInnerJoinQuery(
    selectQueries: SelectQueryBuilder<any>[],
    rootEntityIdSelection: string,
): { query: string; parameters: any[] } {
    let finalQuery = 'WITH w1(id, dv) AS (';
    const union = ' UNION ';
    const parameters: any[] = [];
    selectQueries.forEach((query: SelectQueryBuilder<any>) => {
        const rootQuery = selectQueries[0];
        const rootQueryParameters = rootQuery.getQueryAndParameters()[1];
        parameters.push(...rootQueryParameters);
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
    return { query: finalQuery, parameters };
}

function createEntitiesSelectQueries(
    connection: PolarisConnection,
    rootEntityMetadata: EntityMetadata,
    context: PolarisGraphQLContext,
    criteria: any,
    entityClass: EntityTarget<any>,
    queryRunner?: QueryRunner,
): Map<string, SelectQueryBuilder<any>> {
    const selectQueries: Map<string, SelectQueryBuilder<any>> = new Map();

    const rootEntitySelectQuery = getRootEntitySelectQuery(
        connection,
        rootEntityMetadata,
        context,
        entityClass,
        queryRunner,
        criteria,
    );
    selectQueries.set(rootEntityMetadata.tableName, rootEntitySelectQuery);

    createChildEntitiesSelectQueries(
        rootEntityMetadata,
        context,
        context.dataVersionContext!.mapping!,
        selectQueries,
        rootEntityMetadata.tableName,
        criteria,
    );

    return selectQueries;
}

function getRootEntitySelectQuery(
    connection: PolarisConnection,
    rootEntityMetadata: EntityMetadata,
    context: PolarisGraphQLContext,
    entityClass: EntityTarget<any>,
    queryRunner?: QueryRunner,
    criteria?: any,
): SelectQueryBuilder<any> {
    const rootEntityQueryBuilder = connection.createQueryBuilder(
        entityClass,
        rootEntityMetadata.tableName,
        queryRunner,
    );
    setWhereClauseOfQuery(
        rootEntityQueryBuilder,
        context,
        rootEntityMetadata,
        rootEntityMetadata,
        criteria,
    );
    return rootEntityQueryBuilder.select(`${rootEntityMetadata.tableName}.dataVersion`);
}

function createChildEntitiesSelectQueries(
    entityMetadata: EntityMetadata,
    context: PolarisGraphQLContext,
    mapping: Map<string, any>,
    selectQueries: Map<string, SelectQueryBuilder<any>>,
    currentEntityPath: string,
    criteria?: any,
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
                    entityMetadata,
                    relationEntityMetadata,
                    relation,
                    context,
                    criteria,
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
    rootEntityMetadata: EntityMetadata,
    entityMetadata: EntityMetadata,
    relation: RelationMetadata,
    context: PolarisGraphQLContext,
    criteria?: any,
) {
    setWhereClauseOfQuery(queryBuilder, context, rootEntityMetadata, entityMetadata, criteria);
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
    rootEntityMetadata: EntityMetadata,
    entityMetadata: EntityMetadata,
    criteria?: any,
) {
    let dataVersionThreshold = context.requestHeaders.dataVersion || 0;
    if (context.requestHeaders.lastIdInDV) {
        dataVersionThreshold--;
    }
    const realityIdThreshold = context.requestHeaders.realityId || 0;
    queryBuilder.where(`${entityMetadata.tableName}.dataVersion > ${dataVersionThreshold}`);
    queryBuilder.andWhere(`${rootEntityMetadata.tableName}.realityId = ${realityIdThreshold}`);
    queryBuilder.andWhere(`${rootEntityMetadata.tableName}.deleted = false`);
    FindHandler.applyCustomCriteria(criteria, queryBuilder);
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
