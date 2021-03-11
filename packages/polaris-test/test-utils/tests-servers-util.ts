import { PolarisServer, PolarisServerOptions } from '@enigmatis/polaris-core';
import {
    startTestServerWithoutConnection,
    stopTestServerWithoutConnection,
} from '../server-without-connection/test-server';
import {
    startConnectionlessTestServer,
    stopConnectionlessTestServer,
} from '../server-without-typeorm/test-server';
import {
    startNestTestServerCodeFirst,
    stopNestTestServerCodeFirst,
} from '../nest-server-code-first/test-server';
import {
    startNestTestServerSchemaFirst,
    stopNestTestServerSchemaFirst,
} from '../nest-server-schema-first/test-server';
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
    const nestTestServerCodeFirst: server = {
        start: async () => {
            app = await startNestTestServerCodeFirst(config);
        },
        stop: async () => {
            await stopNestTestServerCodeFirst(app);
        },
    };
    const nestTestServerSchemaFirst: server = {
        start: async () => {
            app = await startNestTestServerSchemaFirst(config);
        },
        stop: async () => {
            await stopNestTestServerSchemaFirst(app);
        },
    };
    return [
        testServer,
        // connectionlessTestServer,
        // nestTestServerSchemaFirst,
        // nestTestServerCodeFirst,
    ];
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
