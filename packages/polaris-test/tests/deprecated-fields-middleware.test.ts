import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as authors from './jsonRequestsAndHeaders/authors.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import { polarisTest } from '../test-utils/polaris-test';

describe('deprecated fields middleware tests', () => {
    test.each(createServers({ shouldAddWarningsToExtensions: true }))('foo', async (server) => {
        await polarisTest(server, async () => {
            await graphQLRequest(createAuthor.request, {}, { firstName: 'foo', lastName: 'bar' });
            const result: any = await graphqlRawRequest(authors.requestCountries);
            const warnings = result.extensions.warnings;

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toBe('country is deprecated');
        });
    });
});
