import { RealitiesHolder } from '@enigmatis/polaris-common';
import { ConnectionOptions, getPolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import { ExpressContext, PolarisServer, PolarisServerOptions } from '../../../src';
import * as customContextFields from './constants/custom-context-fields.json';
import { TestClassInContext } from './context/test-class-in-context';
import { TestContext } from './context/test-context';
import { initConnection } from './dal/connection-manager';
import * as polarisProperties from './resources/polaris-properties.json';
import { resolvers } from './schema/resolvers';
import { typeDefs } from './schema/type-defs';
import { loggerConfig } from './utils/logger';

export const connectionOptions: ConnectionOptions = {
    type: 'postgres',
    url: process.env.CONNECTION_STRING || '',
    entities: [__dirname + '/dal/entities/*.{ts,js}'],
    synchronize: true,
    dropSchema: true,
    logging: true,
    name: process.env.SCHEMA_NAME,
    schema: process.env.SCHEMA_NAME,
    extra: { max: 10 },
};

const customContext = (context: ExpressContext): Partial<TestContext> => {
    const { req, connection } = context;
    const headers = req ? req.headers : connection?.context;

    return {
        customField: customContextFields.customField,
        instanceInContext: new TestClassInContext(
            customContextFields.instanceInContext.someProperty,
        ),
        requestHeaders: {
            customHeader: headers['custom-header'],
        },
    };
};

export async function startTestServer(
    config?: Partial<PolarisServerOptions>,
): Promise<PolarisServer> {
    await initConnection(connectionOptions);
    const options = { ...getDefaultTestServerConfig(), ...config };
    const server = new PolarisServer(options);
    await server.start();
    return server;
}

export async function stopTestServer(server: PolarisServer): Promise<void> {
    await server.stop();
    const connectionManager = getPolarisConnectionManager();
    if (connectionManager.connections.length > 0) {
        const connection = connectionManager.get(process.env.SCHEMA_NAME);
        await connection.close();
        // tslint:disable-next-line:no-console
        console.log('closed');
    }
}

const getDefaultTestServerConfig = (): PolarisServerOptions => {
    return {
        typeDefs,
        resolvers,
        customContext,
        port: polarisProperties.port,
        logger: loggerConfig,
        supportedRealities: new RealitiesHolder(
            new Map([
                [3, { id: 3, type: 'notreal3', name: process.env.SCHEMA_NAME }],
                [0, { id: 0, type: 'realone', name: process.env.SCHEMA_NAME }],
            ]),
        ),
        connectionManager: getPolarisConnectionManager(),
    };
};
