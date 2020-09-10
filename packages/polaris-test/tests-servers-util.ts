import { PolarisServer, PolarisServerOptions } from '@enigmatis/polaris-core';
import { startNestTestServer, stopNestTestServer } from './nest-server/test-server';
import {
    startTestServerWithoutConnection,
    stopTestServerWithoutConnection,
} from './server-without-connection/test-server';
import { startTestServer, stopTestServer } from './server/test-server';
export const createServersWithoutConnection = () => {
    let polarisServer: PolarisServer;
    return [
        {
            start: async () => {
                polarisServer = await startTestServerWithoutConnection();
            },
            stop: async () => {
                await stopTestServerWithoutConnection(polarisServer);
            },
        },
    ];
};
export const createServers = (config?: Partial<PolarisServerOptions>) => {
    let polarisServer: PolarisServer;
    return [
        {
            start: async () => {
                polarisServer = await startTestServer(config);
            },
            stop: async () => {
                await stopTestServer(polarisServer);
            },
        },
        {
            start: async () => {
                await startNestTestServer(config);
            },
            stop: async () => {
                await stopNestTestServer();
            },
        },
    ];
};
