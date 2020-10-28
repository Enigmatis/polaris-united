import http from 'http';
import {
    startPermissionServer,
    stopPermissionServer,
} from '../permission-server-mock/permission-server';
import { graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';

let permissionServer: http.Server;

beforeEach(async () => {
    permissionServer = await startPermissionServer();
});

afterEach(async () => {
    await stopPermissionServer(permissionServer);
});

describe('permissions headers tests', () => {
    test.each(createServers({ permissionsConfig: { permissionsHeaders: ['bar'] } }))(
        'query with configured header',
        async (server) => {
            await polarisTest(server, async () => {
                const headers = { 'oicd-claim-upn': '321', bar: 'something' };
                const result = await graphQLRequest('{ permissionsFieldWithHeader }', headers);
                expect(result.permissionsFieldWithHeader).toBe('hello world!');
            });
        },
    );
});
