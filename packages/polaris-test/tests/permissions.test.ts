import http from 'http';
import { PolarisServer } from '@enigmatis/polaris-core';
import {
    startPermissionServer,
    stopPermissionServer,
} from '../permission-server-mock/permission-server';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../test-utils/graphql-client';

let polarisServer: PolarisServer;
let permissionServer: http.Server;

beforeEach(async () => {
    permissionServer = await startPermissionServer();
    polarisServer = await startTestServer();
});

afterEach(async () => {
    await stopPermissionServer(permissionServer);
    return stopTestServer(polarisServer);
});

describe('permissions tests', () => {
    it('query with authorized upn', async () => {
        const headers = { 'oicd-claim-upn': '123' };
        const result = await graphQLRequest('{ permissionsField }', headers);
        expect(result.permissionsField).toBe('foo bar baz');
    });

    it('query with unauthorized upn', async () => {
        const headers = { 'oicd-claim-upn': '321' };
        await expect(graphQLRequest('{ permissionsField }', headers)).rejects.toThrow('Forbidden');
    });
});
