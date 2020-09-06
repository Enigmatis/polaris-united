import { ApplicationProperties } from '@enigmatis/polaris-common';
import { PolarisServer } from '../../../src';
import { startNestTestServer, stopNestTestServer } from '../nest-server/test-server';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';

let polarisServer: PolarisServer;
const applicationProperties: ApplicationProperties = {
    id: '123123',
    name: 'polaris core tests',
};
const servers = [
    {
        start: async () => {
            polarisServer = await startTestServer({ applicationProperties });
        },
        stop: async () => {
            await stopTestServer(polarisServer);
        },
    },
    {
        start: async () => {
            await startNestTestServer({ applicationProperties });
        },
        stop: async () => {
            await stopNestTestServer();
        },
    },
];

describe('application properties tests', () => {
    test.each(servers)(
        'application properties was provided without version and the default version was applied',
        async server => {
            await server.start();
            const result: any = await graphQLRequest(allBooks.request);
            expect(result.allBooks).toEqual([]);
            await server.stop();
        },
    );
});
