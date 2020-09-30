import { PolarisExtensions, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { DataVersion, PolarisConnection, QueryRunner, SelectQueryBuilder } from '..';
import { EntityMetadata } from '../index';

export class DataVersionHandler {
    public async updateDataVersion<Entity>(
        context: PolarisGraphQLContext,
        connection: PolarisConnection,
        runner: QueryRunner,
    ) {
        const extensions: PolarisExtensions =
            (context && context.returnedExtensions) || ({} as PolarisExtensions);
        connection.logger.log('log', 'Started data version job when inserting/updating entity');
        const result = await this.getDataVersionForMutation(runner, connection);
        if (!result) {
            if (extensions.globalDataVersion) {
                throw new Error(
                    'data version in context even though the data version table is empty',
                );
            }
            connection.logger.log('log', 'no data version found');
            await runner.manager.save(DataVersion, new DataVersion(1));
            connection.logger.log('log', 'data version created');
            extensions.globalDataVersion = 2;
        } else {
            if (!extensions.globalDataVersion) {
                connection.logger.log('log', 'context does not hold data version');
                extensions.globalDataVersion = result.getValue() + 1;
                await runner.manager.increment(DataVersion, {}, 'value', 1);
                connection.logger.log('log', 'data version is incremented and holds new value');
            } else {
                if (extensions.globalDataVersion !== result.getValue()) {
                    throw new Error('data version in context does not equal data version in table');
                }
            }
        }
        if (context && extensions) {
            context.returnedExtensions = extensions;
        }
        connection.logger.log(
            'log',
            'Finished data version job when inserting/updating entity',
            runner,
        );
    }
    private async getDataVersionForMutation(
        runner: any,
        connection: any,
    ): Promise<DataVersion | undefined> {
        let result;
        try {
            if (!runner.isTransactionActive) {
                await runner.startTransaction();
            }
            result = await runner.manager
                .getRepository(DataVersion)
                .createQueryBuilder()
                .useTransaction(true)
                .setLock('pessimistic_write')
                .andWhereInIds(1)
                .getOne();
        } catch (e) {
            connection.logger.log('warn', 'waiting for lock of data version to release');
            await runner.rollbackTransaction();
            result = this.getDataVersionForMutation(runner, connection);
        }
        return result;
    }
}

const loadRelations = (
    qb: any,
    entityMetadata: EntityMetadata,
    names: string[],
    mapping: Map<any, any>,
): any => {
    if (entityMetadata.relations && mapping) {
        for (const relation of entityMetadata.relations) {
            let children;
            if (mapping.has(entityMetadata.name)) {
                children = mapping.get(entityMetadata.name);
            } else {
                if (mapping.has(relation.inverseSidePropertyPath)) {
                    children = mapping.get(relation.inverseSidePropertyPath);
                }
            }
            if (
                children &&
                children.filter((x: any) => x.key === relation.propertyName).length > 0
            ) {
                const relationMetadata = relation.inverseEntityMetadata;
                const isCommonModel =
                    relationMetadata.inheritanceTree.find(
                        (ancestor) => ancestor.name === 'CommonModel',
                    ) !== undefined;
                const alias: string = relationMetadata.tableName;
                const notInJoins = names.filter((x) => x === alias).length === 0;
                if (isCommonModel && notInJoins) {
                    qb = qb.leftJoinAndSelect(
                        entityMetadata.tableName + '.' + relation.propertyName,
                        alias,
                    );
                    names.push(alias);
                    qb = loadRelations(qb, relationMetadata, names, children[0].value);
                }
            }
        }
    }
    return qb;
};
export const dataVersionFilter = (
    connection: PolarisConnection,
    qb: SelectQueryBuilder<any>,
    entity: string,
    context: PolarisGraphQLContext,
) => {
    qb = qb.distinct();
    const entityMetadata = connection.getMetadata(entity);
    let names = [entity];
    qb = loadRelations(qb, entityMetadata, names, context.dataVersionContext!.mapping!);
    const dataVersion = context.requestHeaders.dataVersion;
    qb.where(entity + '.dataVersion > :dataVersion', { dataVersion });
    names = names.slice(1);
    for (const name of names) {
        const dvName = name + 'DataVersion';
        const x = {};
        // @ts-ignore
        x[dvName] = dataVersion;
        qb = qb.orWhere(name + '.' + 'dataVersion > :' + dvName, x);
    }
    return qb;
};
