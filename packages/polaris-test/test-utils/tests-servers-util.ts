import { PolarisServer, PolarisServerOptions } from '@enigmatis/polaris-core';
import {
    startTestServerWithoutConnection,
    stopTestServerWithoutConnection,
} from '../server-without-connection/test-server';
import {
    startConnectionLessTestServer,
    stopConnectionLessTestServer,
} from '../server-without-typeorm/test-server';
import { startNestTestServer, stopNestTestServer } from '../nest-server/test-server';
import { startTestServer, stopTestServer } from '../server/test-server';
import { INestApplication } from '@nestjs/common';

export type server = { start: () => {}; stop: () => {} };

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

export const createServers = (config?: Partial<PolarisServerOptions>): server[] => {
    let polarisServer: PolarisServer;
    let app: INestApplication;
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
                polarisServer = await startConnectionLessTestServer(config);
            },
            stop: async () => {
                await stopConnectionLessTestServer(polarisServer);
            },
        },
        {
            start: async () => {
                app = await startNestTestServer(config);
            },
            stop: async () => {
                await stopNestTestServer(app);
            },
        },
    ];
};
