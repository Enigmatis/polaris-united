import { createServers } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as onlineBooksPagination from './jsonRequestsAndHeaders/onlineBooksPagination.json';

const setUp = async (): Promise<any[]> => {
    const bookIds: any[] = [];
    for (let i = 1; i <= 10; i++) {
        const res = await graphQLRequest(createBook.request, {}, { title: `book${i}` });
        bookIds.push(res.createBook.id);
    }
    return bookIds;
};

const tearDown = (bookIds: any[]) => bookIds.slice(0, bookIds.length - 1);

describe('online pagination tests', () => {
    describe('first & after test cases', () => {
        test.each(createServers())(
            'fetch all books in 2 chunks, books fetched as expected',
            async (server) => {
                await polarisTest(server, async () => {
                    const bookIds = await setUp();
                    const res1 = await graphqlRawRequest(
                        onlineBooksPagination.request,
                        {},
                        { pagingArgs: { first: 6 } },
                    );
                    const afterCursor = res1.data.onlinePaginatedBooks.edges[5].node.id;
                    const res2 = await graphqlRawRequest(
                        onlineBooksPagination.request,
                        {},
                        { pagingArgs: { first: 6, after: afterCursor } },
                    );
                    expect(res1.data.onlinePaginatedBooks.edges.length).toBe(6);
                    expect(res1.data.onlinePaginatedBooks.pageInfo.hasNextPage).toBe(true);
                    expect(res1.data.onlinePaginatedBooks.pageInfo.hasPreviousPage).toBe(false);
                    expect(res2.data.onlinePaginatedBooks.edges.length).toBe(4);
                    expect(res2.data.onlinePaginatedBooks.pageInfo.hasNextPage).toBe(false);
                    expect(res2.data.onlinePaginatedBooks.pageInfo.hasPreviousPage).toBe(true);
                    tearDown(bookIds);
                });
            },
        );
        test.each(createServers())(
            'fetch all books, fetch more than the total count, fetched correct amount of books',
            async (server) => {
                await polarisTest(server, async () => {
                    const bookIds = await setUp();
                    const res1 = await graphqlRawRequest(
                        onlineBooksPagination.request,
                        {},
                        { pagingArgs: { first: 20 } },
                    );
                    expect(res1.data.onlinePaginatedBooks.edges.length).toBe(10);
                    expect(res1.data.onlinePaginatedBooks.pageInfo.hasNextPage).toBe(false);
                    expect(res1.data.onlinePaginatedBooks.pageInfo.hasPreviousPage).toBe(false);
                    tearDown(bookIds);
                });
            },
        );
    });
    describe('last & before test cases', () => {
        test.each(createServers())(
            'fetch all books in 2 chunks, books fetched as expected',
            async (server) => {
                await polarisTest(server, async () => {
                    const bookIds = await setUp();
                    const res1 = await graphqlRawRequest(
                        onlineBooksPagination.request,
                        {},
                        { pagingArgs: { last: 7 } },
                    );
                    const beforeCursor = res1.data.onlinePaginatedBooks.edges[0].node.id;
                    const res2 = await graphqlRawRequest(
                        onlineBooksPagination.request,
                        {},
                        { pagingArgs: { last: 5, before: beforeCursor } },
                    );
                    expect(res1.data.onlinePaginatedBooks.edges.length).toBe(7);
                    expect(res1.data.onlinePaginatedBooks.pageInfo.hasNextPage).toBe(false);
                    expect(res1.data.onlinePaginatedBooks.pageInfo.hasPreviousPage).toBe(true);
                    expect(res2.data.onlinePaginatedBooks.edges.length).toBe(3);
                    expect(res2.data.onlinePaginatedBooks.pageInfo.hasNextPage).toBe(true);
                    expect(res2.data.onlinePaginatedBooks.pageInfo.hasPreviousPage).toBe(false);
                    tearDown(bookIds);
                });
            },
        );
        test.each(createServers())(
            'fetch all books, fetch more than the total count, fetched correct amount of books',
            async (server) => {
                await polarisTest(server, async () => {
                    const bookIds = await setUp();
                    const res1 = await graphqlRawRequest(
                        onlineBooksPagination.request,
                        {},
                        { pagingArgs: { last: 20 } },
                    );
                    expect(res1.data.onlinePaginatedBooks.edges.length).toBe(10);
                    expect(res1.data.onlinePaginatedBooks.pageInfo.hasNextPage).toBe(false);
                    expect(res1.data.onlinePaginatedBooks.pageInfo.hasPreviousPage).toBe(false);
                    tearDown(bookIds);
                });
            },
        );
    });
});
