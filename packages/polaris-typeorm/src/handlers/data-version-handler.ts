import { PolarisExtensions, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { DataVersion, PolarisConnection } from '..';

export class DataVersionHandler {
    public async updateDataVersion<Entity>(
        context: PolarisGraphQLContext,
        connection: PolarisConnection,
    ) {
        const extensions: PolarisExtensions = (context && context.returnedExtensions) || {};
        connection.logger.log('log', 'Started data version job when inserting/updating entity');
        const result: DataVersion | undefined = await connection.manager.findOne(DataVersion, {});
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
            if (!extensions.globalDataVersion) {
                connection.logger.log('log', 'context does not hold data version');
                await connection.manager.increment(DataVersion, {}, 'value', 1);
                const newResult: DataVersion | undefined = await connection.manager.findOne(
                    DataVersion,
                    {},
                );
                if (newResult) {
                    extensions.globalDataVersion = newResult.getValue();
                } else {
                    throw new Error(
                        'global data version was supposed to increment but does not exist',
                    );
                }
                connection.logger.log('log', 'data version is incremented and holds new value ');
            } else {
                if (extensions.globalDataVersion !== result.getValue()) {
                    throw new Error('data version in context does not equal data version in table');
                }
            }
        }
        if (context && extensions) {
            context.returnedExtensions = extensions;
        }
        connection.logger.log('log', 'Finished data version job when inserting/updating entity');
    }
}
