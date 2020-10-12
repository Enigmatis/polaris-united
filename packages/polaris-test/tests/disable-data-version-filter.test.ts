import { createServers } from '../test-utils/tests-servers-util';
import { graphQLRequest } from '../test-utils/graphql-client';
import * as authors from './jsonRequestsAndHeaders/authors.json';
import { createAuthorAndBook, createPen } from './data-version-filter.test';

describe('enable data version filter', () => {
    test.each(createServers({ enableDataVersionFilter: false }))(
        'filter is off ask with dv grandChild dv, entity is not returned',
        async (server) => {
            await server.start();
            const { authorId } = await createAuthorAndBook();
            await createPen(authorId);
            const result = await graphQLRequest(authors.requestAll, { 'data-version': 3 });
            expect(result.authors.length).toEqual(0);
            await server.stop();
        },
    );
});
