import {PolarisExtensions, PolarisGraphQLContext} from '@enigmatis/polaris-common';
import {DataVersion, PolarisConnection, QueryRunner} from '..';

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
