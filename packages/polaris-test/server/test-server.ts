import {
    createPolarisConnection,
    getPolarisConnectionManager,
    LoggerLevel,
    PolarisServer,
    PolarisServerOptions,
    RealitiesHolder,
} from '@enigmatis/polaris-core';
import * as polarisProperties from '../shared-resources/polaris-properties.json';
import { resolvers } from './schema/resolvers';
import { typeDefs } from './schema/type-defs';
import { polarisGraphQLLogger } from '../shared-resources/logger';
import { connectionOptions } from '../shared-resources/connection-options';
import { realitiesConfig } from '../shared-resources/realities-holder';
import { customContext } from '../shared-resources/context/custom-context';

export async function startTestServer(
    config?: Partial<PolarisServerOptions>,
): Promise<PolarisServer> {
    await createPolarisConnection(connectionOptions, polarisGraphQLLogger as any);
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
        logger: polarisGraphQLLogger,
        supportedRealities: new RealitiesHolder(new Map(realitiesConfig)),
        connectionManager: getPolarisConnectionManager(),
    };
};
