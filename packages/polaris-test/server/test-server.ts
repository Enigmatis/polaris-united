import {
    getPolarisConnectionManager,
    PolarisServer,
    PolarisServerOptions,
    RealitiesHolder,
} from '@enigmatis/polaris-core';
import { initConnection } from './dal/connection-manager';
import * as polarisProperties from './resources/polaris-properties.json';
import { resolvers } from './schema/resolvers';
import { typeDefs } from './schema/type-defs';
import { loggerConfig } from '../test-utils/logger';
import { connectionOptions } from '../test-utils/connection-options';
import { realitiesConfig } from "../test-utils/realities-holder";
import { customContext } from "../test-utils/custom-context";


export async function startTestServer(
    config?: Partial<PolarisServerOptions>,
): Promise<PolarisServer> {
    await initConnection({...connectionOptions,
        entities: [__dirname + '/dal/entities/*.{ts,js}'],});
    const options = { ...getDefaultTestServerConfig(), ...config };
    const server = new PolarisServer(options);
    await server.start();
    return server;
}

export async function stopTestServer(server: PolarisServer): Promise<void> {
    await server.stop();
    const connectionManager = getPolarisConnectionManager();
    if (connectionManager.connections.length > 0) {
        for (const connection of connectionManager.connections) {
            await connectionManager.get(connection.name).close();
        }
    }
}

const getDefaultTestServerConfig = (): PolarisServerOptions => {
    return {
        typeDefs,
        resolvers,
        customContext,
        port: polarisProperties.port,
        logger: loggerConfig,
        supportedRealities: new RealitiesHolder(new Map(realitiesConfig)),
        connectionManager: getPolarisConnectionManager(),
    };
};
