import { graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as introspectionQuery from './jsonRequestsAndHeaders/introspectionQuery.json';
import axios from 'axios';
import * as polarisProperties from '../shared-resources/polaris-properties.json';

describe('mandatory headers', () => {
    test.each(createServers({ allowMandatoryHeaders: true }))(
        'not requested in introspection query',
        async (server) => {
            await server.start();
            const url = `http://localhost:${polarisProperties.port}/${polarisProperties.version}/graphql`;
            const result = await axios.post(url, {
                query: introspectionQuery.request,
                operationName: 'IntrospectionQuery',
            });
            expect(result.status).toEqual(200);
            await server.stop();
        },
    );
    test.each(createServers({ allowMandatoryHeaders: true }))(
        'both headers are missing',
        async (server) => {
            await server.start();
            expect.assertions(1);
            try {
                await graphQLRequest(allBooks.request);
            } catch (err) {
                expect(err.response.errors[0].message).toEqual(
                    'Context creation failed: Mandatory headers reality-id & requesting-sys are missing!',
                );
            }
            await server.stop();
        },
    );
    test.each(createServers({ allowMandatoryHeaders: true }))(
        'only requesting sys missing',
        async (server) => {
            await server.start();
            expect.assertions(1);
            try {
                await graphQLRequest(allBooks.request, { 'reality-id': 1 });
            } catch (err) {
                expect(err.response.errors[0].message).toEqual(
                    'Context creation failed: Mandatory header requesting-sys is missing!',
                );
            }
            await server.stop();
        },
    );
    test.each(createServers({ allowMandatoryHeaders: true }))(
        'only reality id missing',
        async (server) => {
            await server.start();
            expect.assertions(1);
            try {
                await graphQLRequest(allBooks.request, { 'requesting-sys': 'me' });
            } catch (err) {
                expect(err.response.errors[0].message).toEqual(
                    'Context creation failed: Mandatory header reality-id is missing!',
                );
            }
            await server.stop();
        },
    );
    test.each(createServers({ allowMandatoryHeaders: true }))(
        'mandatory headers are provided',
        async (server) => {
            await server.start();
            expect.assertions(1);
            const res: any = await graphQLRequest(allBooks.request, {
                'reality-id': 0,
                'requesting-sys': 'me',
            });
            expect(res.allBooks).toBeDefined();
            await server.stop();
        },
    );
});
