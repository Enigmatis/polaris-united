import { createServers } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as onlinePaginatedAuthors from './jsonRequestsAndHeaders/onlinePaginatedAuthors.json';

const setUp = async (iterations: number = 10) => {
    for (let i = 1; i <= iterations; i++) {
        const author = await graphQLRequest(
            createAuthor.request,
            {},
            { firstName: `Ron${i}`, lastName: `Katz${i}` },
        );
        await graphQLRequest(
            createBook.request,
            {},
            { title: `book${i}`, authorId: author.createAuthor.id },
        );
    }
};

describe('online pagination tests', () => {
    test.each(createServers())(
        'fetch authors, page-size and data version sent, return accordingly',
        async (server) => {
            await polarisTest(server, async () => {
                const iterations = 10;
                await setUp();
                const res1 = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 2, 'data-version': 1 },
                    {},
                );
                expect(res1.data.onlinePaginatedAuthors.length).toEqual(2);
                expect(res1.extensions.lastIdInDataVersion).toBeDefined();
                expect(res1.extensions.lastDataVersionInPage).toBeDefined();
                expect(res1.extensions.totalCount).toEqual(iterations);
            });
        },
    );
});
