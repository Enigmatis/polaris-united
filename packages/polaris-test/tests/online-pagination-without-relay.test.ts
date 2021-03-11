import { createServers } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createChapter from './jsonRequestsAndHeaders/createChapter.json';
import * as deleteAuthor from './jsonRequestsAndHeaders/deleteAuthor.json';
import * as createManyAuthors from './jsonRequestsAndHeaders/createManyAuthors.json';
import * as onlinePaginatedAuthorsWithLeftJoin from './jsonRequestsAndHeaders/onlinePaginatedAuthorsWithLeftJoin.json';
import * as onlinePaginatedAuthorsWithInnerJoin from './jsonRequestsAndHeaders/onlinePaginatedAuthorsWithInnerJoin.json';

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

const createServersWithInnerAndLeftJoin = (): any[] => {
    const servers = createServers();
    const innerJoinQuery = onlinePaginatedAuthorsWithInnerJoin.requestBooksWithGenres;
    const leftJoinQuery = onlinePaginatedAuthorsWithLeftJoin.requestBooksWithoutChapters;
    const serversWithJoins = [];
    for (const server of servers) {
        serversWithJoins.push([server, innerJoinQuery]);
        serversWithJoins.push([server, leftJoinQuery]);
    }
    return serversWithJoins;
};

const extractRelevantDataByQuery = (query: string, data: any) => {
    if (query === onlinePaginatedAuthorsWithInnerJoin.requestBooksWithGenres) {
        return data.onlinePaginatedAuthorsWithInnerJoin;
    } else {
        return data.onlinePaginatedAuthorsWithLeftJoin;
    }
};

const extractRelevantIrrelevantEntitiesByQuery = (query: string, irrelevantEntities: any) => {
    if (query === onlinePaginatedAuthorsWithInnerJoin.requestBooksWithGenres) {
        return irrelevantEntities.onlinePaginatedAuthorsWithInnerJoin;
    } else {
        return irrelevantEntities.onlinePaginatedAuthorsWithLeftJoin;
    }
};

describe('online pagination tests - left outer join implementation', () => {
    test.each(createServersWithInnerAndLeftJoin())(
        'fetch authors, page-size and data version sent, return accordingly',
        async (server, query) => {
            await polarisTest(server, async () => {
                const iterations = 10;
                await setUp(iterations);
                const res1 = await graphqlRawRequest(
                    query,
                    { 'page-size': 2, 'data-version': 2 },
                    {},
                );
                const data = extractRelevantDataByQuery(query, res1.data);
                expect(data.length).toEqual(2);
                expect(res1.extensions.lastIdInDataVersion).toBeDefined();
                expect(res1.extensions.lastDataVersionInPage).toEqual(5);
            });
        },
    );
    test.each(createServersWithInnerAndLeftJoin())(
        'fetch authors, page-size and data version not sent, return first page with default page size',
        async (server, query) => {
            await polarisTest(server, async () => {
                const iterations = 60;
                await setUp(iterations);
                const res1 = await graphqlRawRequest(query, {}, {});
                const data = extractRelevantDataByQuery(query, res1.data);
                expect(data.length).toEqual(50);
                expect(res1.extensions.lastIdInDataVersion).toBeDefined();
                expect(res1.extensions.lastDataVersionInPage).toEqual(101);
            });
        },
    );
    test.each(createServersWithInnerAndLeftJoin())(
        'fetch authors, fetch last page, returns correctly',
        async (server, query) => {
            await polarisTest(server, async () => {
                const iterations = 7;
                await setUp(iterations);
                let res1 = await graphqlRawRequest(
                    query,
                    { 'page-size': 5, 'data-version': 1 },
                    {},
                );
                const lastIdInDv = res1.extensions.lastIdInDataVersion;
                const lastDv = res1.extensions.lastDataVersionInPage;
                res1 = await graphqlRawRequest(
                    query,
                    { 'page-size': 5, 'data-version': lastDv, 'last-id-in-dv': lastIdInDv },
                    {},
                );
                const data = extractRelevantDataByQuery(query, res1.data);
                expect(data.length).toEqual(2);
                expect(res1.extensions.lastIdInDataVersion).not.toBeDefined();
                expect(res1.extensions.lastDataVersionInPage).not.toBeDefined();
            });
        },
    );
    test.each(createServersWithInnerAndLeftJoin())(
        'fetch authors, fetch two consecutive pages, return correctly',
        async (server, query) => {
            await polarisTest(server, async () => {
                const iterations = 5;
                await setUp(iterations);
                const firstFour = await graphqlRawRequest(
                    query,
                    { 'page-size': 4, 'data-version': 1 },
                    {},
                );
                const firstFourAuthors = extractRelevantDataByQuery(query, firstFour.data);
                const firstTwo = await graphqlRawRequest(
                    query,
                    { 'page-size': 2, 'data-version': 1 },
                    {},
                );
                const lastIdInDv = firstTwo.extensions.lastIdInDataVersion;
                const lastDv = firstTwo.extensions.lastDataVersionInPage;
                const firstTwoAuthors = extractRelevantDataByQuery(query, firstTwo.data);
                const nextTwo = await graphqlRawRequest(
                    query,
                    { 'page-size': 2, 'data-version': lastDv, 'last-id-in-dv': lastIdInDv },
                    {},
                );
                const nextTwoAuthors = extractRelevantDataByQuery(query, nextTwo.data);
                expect([...firstTwoAuthors, ...nextTwoAuthors]).toEqual(firstFourAuthors);
            });
        },
    );
    test.each(createServersWithInnerAndLeftJoin())(
        'fetch authors with irrelevant entities, returns in extensions',
        async (server, query) => {
            await polarisTest(server, async () => {
                for (let i = 1; i <= 12; i++) {
                    const author = await graphQLRequest(
                        createAuthor.request,
                        {},
                        { firstName: `Ron${i}`, lastName: `Katz${i}` },
                    );
                    const book = await graphQLRequest(
                        createBook.request,
                        {},
                        { title: `book${i}`, authorId: author.createAuthor.id },
                    );
                    await graphQLRequest(
                        createChapter.request,
                        {},
                        { number: i, bookId: book.createBook.id },
                    );
                    if (i === 7 || i === 8) {
                        await graphQLRequest(
                            deleteAuthor.request,
                            {},
                            { id: author.createAuthor.id },
                        );
                    }
                }
                let res1 = await graphqlRawRequest(
                    query,
                    { 'page-size': 5, 'data-version': 1 },
                    {},
                );
                const lastIdInDv = res1.extensions.lastIdInDataVersion;
                const lastDv = res1.extensions.lastDataVersionInPage;
                res1 = await graphqlRawRequest(
                    query,
                    { 'page-size': 5, 'data-version': lastDv, 'last-id-in-dv': lastIdInDv },
                    {},
                );
                const irrelevantEntities = extractRelevantIrrelevantEntitiesByQuery(
                    query,
                    res1.extensions.irrelevantEntities,
                );
                expect(irrelevantEntities.length).toEqual(2);
            });
        },
    );
    test.each(createServersWithInnerAndLeftJoin())(
        'fetch authors, fetch two consecutive pages with same data version, return correctly',
        async (server, query) => {
            await polarisTest(server, async () => {
                await graphqlRawRequest(createManyAuthors.request, {}, {});
                const firstFour = await graphqlRawRequest(
                    query,
                    { 'page-size': 4, 'data-version': 1 },
                    {},
                );
                const firstFourAuthors = extractRelevantDataByQuery(query, firstFour.data);
                const firstTwo = await graphqlRawRequest(
                    query,
                    { 'page-size': 2, 'data-version': 1 },
                    {},
                );
                const lastIdInDv = firstTwo.extensions.lastIdInDataVersion;
                const lastDv = firstTwo.extensions.lastDataVersionInPage;
                const firstTwoAuthors = extractRelevantDataByQuery(query, firstTwo.data);
                const nextTwo = await graphqlRawRequest(
                    query,
                    { 'last-id-in-dv': lastIdInDv, 'page-size': 2, 'data-version': lastDv },
                    {},
                );
                const nextTwoAuthors = extractRelevantDataByQuery(query, nextTwo.data);
                for (const author of [...firstTwoAuthors, ...nextTwoAuthors]) {
                    expect(firstFourAuthors).toContainEqual(author);
                }
            });
        },
    );
    test.each(createServers())(
        'execute online paging, there is no transactions active',
        async (server) => {
            await polarisTest(server, async () => {
                const iterations = 10;
                await setUp(iterations);
                await graphqlRawRequest(
                    onlinePaginatedAuthorsWithLeftJoin.requestBooksWithoutChapters,
                    { 'page-size': 2, 'data-version': 2 },
                    {},
                );
                const res = await graphqlRawRequest('query { isThereTransactionActive }', {}, {});
                expect(res.data.isThereTransactionActive).toEqual(false);
            });
        },
    );
});
