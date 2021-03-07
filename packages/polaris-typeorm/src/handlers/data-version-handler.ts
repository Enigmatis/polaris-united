import { PolarisExtensions, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { EntityMetadata } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { DataVersion, PolarisConnection, PolarisEntityManager, SelectQueryBuilder } from '..';
import { isDescendentOfCommonModel } from '../utils/descendent-of-common-model';
import { cloneDeep } from 'lodash';

export class DataVersionHandler {
    public async updateDataVersion<Entity>(
        connection: PolarisConnection,
        manager: PolarisEntityManager,
    ) {
        const extensions: PolarisExtensions =
            (manager.context && manager.context.returnedExtensions) || ({} as PolarisExtensions);
        connection.logger.log('log', 'Started data version job when inserting/updating entity');
        const result = await this.selectDataVersionForUpdate(manager, connection);
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
            } else {
                if (extensions.dataVersion !== result.value) {
                    throw new Error('data version in context does not equal data version in table');
                }
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
        qb.where(`${qb.alias}.dataVersion > :dataVersion`, { dataVersion });
        names = names.slice(1);
        for (const name of names) {
            qb = qb.orWhere(`${name}.dataVersion > :dataVersion`);
        }
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
) => {
    if (context.dataVersionContext?.mapping) {
        const selectQueriesMap: Map<string, SelectQueryBuilder<any>> = createEntitiesSelectQueries(
            connection,
            rootEntityMetadata,
            context,
        );

        const rootEntityIdColumnName: string = getRootEntityIdColumnName(
            rootEntityMetadata,
            context,
        )!;
        const rootEntityIdSelection = `"${rootEntityMetadata.name.toLowerCase()}"."${rootEntityIdColumnName}"`;

        return buildInnerJoinQuery([...selectQueriesMap.values()], rootEntityIdSelection);
    }
    throw new Error(`There is no defined data version mapping. Can't execute inner join query`);
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
        ') SELECT w1.id, MAX(w1.dv) AS MaxDv FROM w1 GROUP BY w1.id ORDER BY MaxDv, id',
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
    selectQueries.set(rootEntityMetadata.name.toLowerCase(), rootEntitySelectQuery);

    createChildEntitiesSelectQueries(
        rootEntityMetadata,
        context,
        context.dataVersionContext!.mapping!,
        selectQueries,
        rootEntityMetadata.name.toLowerCase(),
    );

    return selectQueries;
}

function getRootEntityIdColumnName(
    entityMetadata: EntityMetadata,
    context: PolarisGraphQLContext,
): string | undefined {
    const mapping = context.dataVersionContext!.mapping!;
    if (mapping.get(entityMetadata.targetName)) {
        const relation = entityMetadata.relations.find(
            (rel) => rel.propertyName === mapping.values().next().value.entries().next().value[0],
        );
        const foreignKey = relation?.inverseEntityMetadata.foreignKeys.find(
            (key) => key.referencedEntityMetadata === entityMetadata,
        );
        return foreignKey?.referencedColumnNames[0];
    }
    return undefined;
}

function getRootEntitySelectQuery(
    connection: PolarisConnection,
    rootEntityMetadata: EntityMetadata,
    context: PolarisGraphQLContext,
): SelectQueryBuilder<any> {
    const rootEntityQueryBuilder = connection.createQueryBuilder();
    setWhereClauseOfQuery(rootEntityQueryBuilder, context, rootEntityMetadata);
    return rootEntityQueryBuilder
        .addSelect(`${rootEntityMetadata.name.toLowerCase()}.dataVersion`)
        .addFrom(rootEntityMetadata.name.toLowerCase(), rootEntityMetadata.name.toLowerCase());
}

function createChildEntitiesSelectQueries(
    entityMetadata: EntityMetadata,
    context: PolarisGraphQLContext,
    mapping: Map<string, any>,
    selectQueries: Map<string, SelectQueryBuilder<any>>,
    currentEntityPath: string,
) {
    if (entityMetadata.relations && mapping.size > 0) {
        for (const relation of entityMetadata.relations) {
            const childDVMapping = getChildDVMapping(mapping, relation, entityMetadata);
            if (childDVMapping) {
                const relationEntityMetadata = relation.inverseEntityMetadata;
                const fatherSelectQuery = getFatherSelectQuery(currentEntityPath, selectQueries);
                const relationQueryBuilder: SelectQueryBuilder<any> = cloneDeep(fatherSelectQuery!);
                if (
                    relation.relationType === 'one-to-many' ||
                    relation.relationType === 'many-to-one'
                ) {
                    handleInnerJoinForOneToManyRelation(
                        relationQueryBuilder,
                        relationEntityMetadata,
                        relation,
                        context,
                    );
                } else if (relation.relationType === 'many-to-many') {
                    handleInnerJoinForManyToManyRelation(
                        relationQueryBuilder,
                        relationEntityMetadata,
                        relation,
                        context,
                    );
                }
                const entityPath = `${currentEntityPath}.${relationEntityMetadata.name.toLowerCase()}`;
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

function handleInnerJoinForOneToManyRelation(
    queryBuilder: SelectQueryBuilder<any>,
    entityMetadata: EntityMetadata,
    relation: RelationMetadata,
    context: PolarisGraphQLContext,
) {
    const innerJoinCondition = getInnerJoinCondition(relation);
    setWhereClauseOfQuery(queryBuilder, context, entityMetadata);
    queryBuilder
        .select(`${entityMetadata.name.toLowerCase()}.dataVersion`)
        .innerJoin(
            entityMetadata.target,
            entityMetadata.targetName.toLowerCase(),
            innerJoinCondition || '',
        );
}

function handleInnerJoinForManyToManyRelation(
    queryBuilder: SelectQueryBuilder<any>,
    entityMetadata: EntityMetadata,
    relation: RelationMetadata,
    context: PolarisGraphQLContext,
) {
    const innerJoinsConditions: string[] = getManyToManyInnerJoinConditions(relation);
    if (innerJoinsConditions.length === 2) {
        setWhereClauseOfQuery(queryBuilder, context, entityMetadata);
        queryBuilder
            .select(`${entityMetadata.name.toLowerCase()}.dataVersion`)
            .innerJoin(
                relation.junctionEntityMetadata!.tableName.toLowerCase(),
                relation.junctionEntityMetadata!.tableName.toLowerCase(),
                innerJoinsConditions[0],
            )
            .innerJoin(
                entityMetadata.target,
                entityMetadata.targetName.toLowerCase(),
                innerJoinsConditions[1],
            );
    }
}

function getManyToManyInnerJoinConditions(relation: RelationMetadata): string[] {
    const conditions: string[] = [];

    const fatherSideCondition = getInnerJoinConditionByEntityMetadata(
        relation,
        relation.entityMetadata,
    );
    if (fatherSideCondition) {
        conditions.push(fatherSideCondition);
    }
    const childSideCondition = getInnerJoinConditionByEntityMetadata(
        relation,
        relation.inverseEntityMetadata,
    );
    if (childSideCondition) {
        conditions.push(childSideCondition);
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
        return `${relation.junctionEntityMetadata!.tableName.toLowerCase()}.${
            joinTableEntityColumn?.databaseName
        } = ${entityMetadata.name.toLowerCase()}.${idColumnName}`;
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
    queryBuilder.where(
        `${entityMetadata.name.toLowerCase()}.dataVersion > ${dataVersionThreshold}`,
    );
    queryBuilder.andWhere(`${entityMetadata.name.toLowerCase()}.realityId = ${realityIdThreshold}`);
    queryBuilder.andWhere(`${entityMetadata.name.toLowerCase()}.deleted = false`);
}

function getChildDVMapping(
    mapping: Map<string, any>,
    relation: RelationMetadata,
    entityMetadata: EntityMetadata,
) {
    const children = extractRelations(mapping, entityMetadata, relation);
    return children ? getPropertyMap(children, relation) : undefined;
}

function getFatherSelectQuery(
    currentEntityPath: string,
    selectQueries: Map<string, SelectQueryBuilder<any>>,
): SelectQueryBuilder<any> | undefined {
    return selectQueries.get(currentEntityPath);
}

function getInnerJoinCondition(relation: RelationMetadata) {
    const fatherIdColumnName = getIdColumnName(relation, relation.entityMetadata);
    if (fatherIdColumnName) {
        const childReferencedColumnName = getChildReferencedColumnName(
            relation.inverseEntityMetadata,
            relation.entityMetadata.tableName,
        );
        return `${relation.entityMetadata.name.toLowerCase()}.${fatherIdColumnName}=${relation.inverseEntityMetadata.name.toLowerCase()}.${childReferencedColumnName}`;
    }
}

function getChildReferencedColumnName(entityMetadata: EntityMetadata, fatherTableName: string) {
    const fatherReferencedColumn = entityMetadata.columns.find((column) =>
        column.databaseName.includes(fatherTableName),
    );
    if (fatherReferencedColumn) {
        return fatherReferencedColumn.databaseName;
    }
}

function getIdColumnName(
    relation: RelationMetadata,
    entityMetadata: EntityMetadata,
): string | undefined {
    if (relation.relationType === 'one-to-many' || relation.relationType === 'many-to-one') {
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
