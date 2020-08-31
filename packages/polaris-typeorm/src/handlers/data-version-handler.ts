import { PolarisExtensions, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { DataVersion, PolarisConnection } from '..';

export class DataVersionHandler {
    public async updateDataVersion<Entity>(
        context: PolarisGraphQLContext,
        connection: PolarisConnection,
    ) {
        const extensions: PolarisExtensions = (context && context.returnedExtensions) || {};
        connection.logger.log('log', 'Started data version job when inserting/updating entity');
        const id = context?.requestHeaders?.requestId;
        const runner = id
            ? connection.queryRunners.get(id) || connection.createQueryRunner()
            : connection.createQueryRunner();
        const result = await this.getDataVersionForMutation(runner, connection);
        if (!result) {
            if (extensions.globalDataVersion) {
                throw new Error(
                    'data version in context even though the data version table is empty',
                );
            }
            connection.logger.log('log', 'no data version found');
            await connection.manager.save(DataVersion, new DataVersion(1));
            connection.logger.log('log', 'data version created');
            extensions.globalDataVersion = 1;
        } else {
            connection.logger.log('log', 'context does not hold data version', runner);
            extensions.globalDataVersion = result.getValue() + 1;
            connection.logger.log('log', 'data version set to extensions', runner);
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
                await runner.startTransaction('SERIALIZABLE');
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
            await sleep(5000);
            result = this.getDataVersionForMutation(runner, connection);
        }
        return result;
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
