import { PolarisServer, PolarisServerOptions } from '@enigmatis/polaris-core';
import {
    startTestServerWithoutConnection,
    stopTestServerWithoutConnection,
} from '../server-without-connection/test-server';
import {
    startConnectionlessTestServer,
    stopConnectionlessTestServer,
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
    const testServer: server = {
        start: async () => {
            polarisServer = await startTestServer(config);
        },
        stop: async () => {
            await stopTestServer(polarisServer);
        },
    };
    const connectionlessTestServer: server = {
        start: async () => {
            polarisServer = await startConnectionlessTestServer(config);
        },
        stop: async () => {
            await stopConnectionlessTestServer(polarisServer);
        },
    };
    const nestTestServer: server = {
        start: async () => {
            app = await startNestTestServer(config);
        },
        stop: async () => {
            await stopNestTestServer(app);
        },
    };
    return [testServer, nestTestServer, connectionlessTestServer];
};

export const createServersWithoutNestServer = (
    config?: Partial<PolarisServerOptions>,
): server[] => {
    let polarisServer: PolarisServer;
    const testServer: server = {
        start: async () => {
            polarisServer = await startTestServer(config);
        },
        stop: async () => {
            await stopTestServer(polarisServer);
        },
    };
    const connectionlessTestServer: server = {
        start: async () => {
            polarisServer = await startConnectionlessTestServer(config);
        },
        stop: async () => {
            await stopConnectionlessTestServer(polarisServer);
        },
    };
    return [testServer, connectionlessTestServer];
};
