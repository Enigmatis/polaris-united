import { createServers } from '../test-utils/tests-servers-util';
import { graphQLRequest } from '../test-utils/graphql-client';
import * as authors from './jsonRequestsAndHeaders/authors.json';
import { createAuthorAndBook, createPen } from './data-version-filter.test';
import { polarisTest } from '../test-utils/polaris-test';

describe('enable data version filter', () => {
    // TODO: figure out how to make the config to not be burnt to the scope,
    //  so the data version middleware would be able to see the config has changed
    test.skip.each([createServers({ enableDataVersionFilter: false })[0]])(
        'filter is off, ask with dv grandChild dv, entity is not returned',
        async (server) => {
            await polarisTest(server, async () => {
                const { authorId } = await createAuthorAndBook();
                await createPen(authorId);
                const result = await graphQLRequest(authors.requestAll, { 'data-version': 3 });
                expect(result.authors.length).toEqual(0);
            });
        },
    );
});
