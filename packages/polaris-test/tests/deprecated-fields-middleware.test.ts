import { graphqlRawRequest, graphQLRequest, url } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as authors from './jsonRequestsAndHeaders/authors.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import { polarisTest } from '../test-utils/polaris-test';

const createAuthorForTests = async (): Promise<void> => {
    await graphQLRequest(createAuthor.request, {}, { firstName: 'foo', lastName: 'bar' });
};

describe('deprecated fields middleware tests', () => {
    test.each(createServers({ shouldAddWarningsToExtensions: true }))(
        'query deprecated field, warning returned in extensions',
        async (server) => {
            await polarisTest(server, async () => {
                await createAuthorForTests();
                const result: any = await graphqlRawRequest(authors.requestCountries);
                const warnings = result.extensions.warnings;

                expect(warnings.length).toBe(1);
                expect(warnings[0]).toBe('country is deprecated');
            });
        },
    );
    test.each(createServers({ shouldAddWarningsToExtensions: true }))(
        'query multiple deprecated fields, warnings returned in extensions',
        async (server) => {
            await polarisTest(server, async () => {
                await createAuthorForTests();
                const result: any = await graphqlRawRequest(authors.requestDeprecatedFields);
                const warnings = result.extensions.warnings;

                expect(warnings.length).toBe(2);
                expect(warnings[0]).toBe('country is deprecated');
                expect(warnings[1]).toBe('deprecatedField is deprecated');
            });
        },
    );
    test.each(createServers({ shouldAddWarningsToExtensions: true }))(
        'query without deprecated fields, warnings in extensions is empty',
        async (server) => {
            await polarisTest(server, async () => {
                await createAuthorForTests();
                const result: any = await graphqlRawRequest(authors.request);
                const warnings = result.extensions.warnings;

                expect(warnings.length).toBe(0);
            });
        },
    );
});
