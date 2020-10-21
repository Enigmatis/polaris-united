import {PolarisLogger} from '@enigmatis/polaris-logs';
import {createPolarisConnection, getPolarisConnectionManager, PolarisConnection,} from '../../../src';
import {applicationLogProperties, connectionOptions, loggerConfig,} from '../utils/test-properties';

describe('get connection manager tests', () => {
    it('create connection and get it from manager, expect them to be the same one', async () => {
        const polarisGraphQLLogger = await new PolarisLogger(
            loggerConfig,
            applicationLogProperties,
        );
        const connection: PolarisConnection = await createPolarisConnection(
            connectionOptions,
            polarisGraphQLLogger,
        );
        expect(getPolarisConnectionManager().get(process.env.SCHEMA_NAME)).toEqual(connection);
        await connection.close();
    });
});
