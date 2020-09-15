import { PolarisServer } from '@enigmatis/polaris-core';
import * as polarisProperties from './resources/polaris-properties.json';
import { resolvers } from './schema/resolvers';
import { typeDefs } from './schema/type-defs';
import { UpperCaseDirective } from './schema/upper-case-directive';

export async function startTestServerWithoutConnection(): Promise<PolarisServer> {
    const server = new PolarisServer({
        typeDefs,
        resolvers,
        port: polarisProperties.port,
        applicationProperties: {
            id: polarisProperties.id,
            name: polarisProperties.name,
            version: polarisProperties.version,
            environment: polarisProperties.environment,
            component: polarisProperties.component,
        },
        schemaDirectives: {
            upper: UpperCaseDirective,
        },
    });

    await server.start();
    return server;
}

export async function stopTestServerWithoutConnection(server: PolarisServer) {
    await server.stop();
}