import http from 'http';
import {startPermissionServer, stopPermissionServer,} from '../permission-server-mock/permission-server';
import {graphQLRequest} from '../test-utils/graphql-client';
import {createServers} from '../test-utils/tests-servers-util';

let permissionServer: http.Server;

beforeEach(async () => {
    permissionServer = await startPermissionServer();
});

afterEach(async () => {
    await stopPermissionServer(permissionServer);
});

describe('permissions tests', () => {
    test.each(createServers())('query with authorized upn', async (server) => {
        await server.start();
        const headers = { 'oicd-claim-upn': '123' };
        const result = await graphQLRequest('{ permissionsField }', headers);
        expect(result.permissionsField).toBe('foo bar baz');
        await server.stop();
    });
    test.each(createServers())('query with unauthorized upn', async (server) => {
        await server.start();
        const headers = { 'oicd-claim-upn': '321' };
        await expect(graphQLRequest('{ permissionsField }', headers)).rejects.toThrow('Forbidden');
        await server.stop();
    });
});
