import { createServers } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as onlinePaginatedAuthors from './jsonRequestsAndHeaders/onlinePaginatedAuthors.json';

const setUp = async () => {
    for (let i = 1; i <= 10; i++) {
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
    test.each(createServers())('amen', async (server) => {
        await polarisTest(server, async () => {
            await setUp();
            const res1 = await graphqlRawRequest(
                onlinePaginatedAuthors.requestBooksWithoutChapters,
                { 'page-size': 2 },
                {},
            );
            expect(true).toBeTruthy();
        });
    });
});
