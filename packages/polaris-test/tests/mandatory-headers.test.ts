import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as introspectionQuery from './jsonRequestsAndHeaders/introspectionQuery.json';

describe('mandatory headers', () => {
    test.each(createServers({ allowMandatoryHeaders: true }))(
        'not requested in introspection query',
        async (server) => {
            await server.start();
            const res: any = await graphqlRawRequest(introspectionQuery.request, undefined, {
                operationName: 'IntrospectionQuery',
            });
            expect(res).toBeDefined();
            await server.stop();
        },
    );
    test.each(createServers({ allowMandatoryHeaders: true }))(
        'only requesting sys missing',
        async (server) => {
            await server.start();
            const res: any = await graphQLRequest(allBooks.request, { 'reality-id': 1 });
            expect(res).toBeDefined();
            await server.stop();
        },
    );
    test.each(createServers({ allowMandatoryHeaders: true }))(
        'only reality id missing',
        async (server) => {
            await server.start();
            const res: any = await graphQLRequest(allBooks.request, { 'requesting-sys': 'me' });
            expect(res).toBeDefined();
            await server.stop();
        },
    );
    test.each(createServers({ allowMandatoryHeaders: true }))(
        'reality id & requesting system are missing',
        async (server) => {
            await server.start();
            const res: any = await graphQLRequest(allBooks.request, {
                'reality-id': 1,
                'requesting-sys': 'me',
            });
            expect(res).toBeDefined();
            await server.stop();
        },
    );
});
