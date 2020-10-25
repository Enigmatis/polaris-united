import { graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as introspectionQuery from './jsonRequestsAndHeaders/introspectionQuery.json';
import axios from 'axios';
import * as polarisProperties from '../shared-resources/polaris-properties.json';
import { polarisTest } from '../test-utils/polaris-test';

const config = { allowMandatoryHeaders: true };
describe('mandatory headers', () => {
    test.each(createServers(config))('not requested in introspection query', async (server) => {
        await polarisTest(server, async () => {
            const url = `http://localhost:${polarisProperties.port}/${polarisProperties.version}/graphql`;
            const result = await axios.post(url, {
                query: introspectionQuery.request,
                operationName: 'IntrospectionQuery',
            });
            expect(result.status).toEqual(200);
        });
    });
    test.each(createServers(config))('both headers are missing', async (server) => {
        await polarisTest(server, async () => {
            await expect(graphQLRequest(allBooks.request)).rejects.toThrow(
                'Context creation failed: Mandatory headers reality-id & requesting-sys are missing!',
            );
        });
    });
    test.each(createServers(config))('only requesting sys missing', async (server) => {
        await polarisTest(server, async () => {
            await expect(graphQLRequest(allBooks.request, { 'reality-id': 1 })).rejects.toThrow(
                'Context creation failed: Mandatory header requesting-sys is missing!',
            );
        });
    });
    test.each(createServers(config))('only reality id missing', async (server) => {
        await polarisTest(server, async () => {
            await expect(
                graphQLRequest(allBooks.request, { 'requesting-sys': 'me' }),
            ).rejects.toThrow('Context creation failed: Mandatory header reality-id is missing!');
        });
    });
    test.each(createServers(config))('mandatory headers are provided', async (server) => {
        await polarisTest(server, async () => {
            const res: any = await graphQLRequest(allBooks.request, {
                'reality-id': 0,
                'requesting-sys': 'me',
            });
            expect(res.allBooks).toBeDefined();
        });
    });
});
