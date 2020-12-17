import { createServers } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createChapter from './jsonRequestsAndHeaders/createChapter.json';
import * as deleteAuthor from './jsonRequestsAndHeaders/deleteAuthor.json';
import * as createManyAuthors from './jsonRequestsAndHeaders/createManyAuthors.json';
import * as onlinePaginatedAuthors from './jsonRequestsAndHeaders/onlinePaginatedAuthors.json';

const setUp = async (iterations: number = 10) => {
    for (let i = 1; i <= iterations; i++) {
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
        await graphQLRequest(createChapter.request, {}, { number: i, bookId: book.createBook.id });
    }
};

describe('online pagination tests', () => {
    test.each(createServers())(
        'fetch authors, page-size and data version sent, return accordingly',
        async (server) => {
            await polarisTest(server, async () => {
                const iterations = 10;
                await setUp(iterations);
                const res1 = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithChapters,
                    { 'page-size': 2, 'data-version': 2 },
                    {},
                );
                expect(res1.data.onlinePaginatedAuthors.length).toEqual(2);
                expect(res1.extensions.lastIdInDataVersion).toBeDefined();
                expect(res1.extensions.lastDataVersionInPage).toEqual(7);
                expect(res1.extensions.totalCount).toEqual(iterations);
            });
        },
    );
    test.each(createServers())(
        'fetch authors, page-size and data version not sent, return first page with default page size',
        async (server) => {
            await polarisTest(server, async () => {
                const iterations = 60;
                await setUp(iterations);
                const res1 = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    {},
                    {},
                );
                expect(res1.data.onlinePaginatedAuthors.length).toEqual(50);
                expect(res1.extensions.lastIdInDataVersion).toBeDefined();
                expect(res1.extensions.lastDataVersionInPage).toEqual(150);
                expect(res1.extensions.totalCount).toEqual(iterations);
            });
        },
    );
    test.each(createServers())(
        'fetch authors, fetch last page, returns correctly',
        async (server) => {
            await polarisTest(server, async () => {
                const iterations = 7;
                await setUp(iterations);
                let res1 = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 5, 'data-version': 1 },
                    {},
                );
                const lastIdInDv = res1.extensions.lastIdInDataVersion;
                const lastDv = res1.extensions.lastDataVersionInPage;
                res1 = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 5, 'data-version': lastDv, 'last-id-in-dv': lastIdInDv },
                    {},
                );
                expect(res1.data.onlinePaginatedAuthors.length).toEqual(2);
                expect(res1.extensions.lastIdInDataVersion).not.toBeDefined();
                expect(res1.extensions.lastDataVersionInPage).not.toBeDefined();
                expect(res1.extensions.totalCount).toEqual(iterations);
            });
        },
    );
    test.each(createServers())(
        'fetch authors, fetch two consecutive pages, return correctly',
        async (server) => {
            await polarisTest(server, async () => {
                const iterations = 5;
                await setUp(iterations);
                const firstFour = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 4, 'data-version': 1 },
                    {},
                );
                const firstFourAuthors = firstFour.data.onlinePaginatedAuthors;
                const firstTwo = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 2, 'data-version': 1 },
                    {},
                );
                const lastIdInDv = firstTwo.extensions.lastIdInDataVersion;
                const lastDv = firstTwo.extensions.lastDataVersionInPage;
                const firstTwoAuthors = firstTwo.data.onlinePaginatedAuthors;
                const nextTwo = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 2, 'data-version': lastDv, 'last-id-in-dv': lastIdInDv },
                    {},
                );
                const nextTwoAuthors = nextTwo.data.onlinePaginatedAuthors;
                expect([...firstTwoAuthors, ...nextTwoAuthors]).toEqual(firstFourAuthors);
            });
        },
    );
    test.each(createServers())(
        'fetch authors with irrelevant entities, returns in extensions',
        async (server) => {
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
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 5, 'data-version': 1 },
                    {},
                );
                const lastIdInDv = res1.extensions.lastIdInDataVersion;
                const lastDv = res1.extensions.lastDataVersionInPage;
                res1 = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 5, 'data-version': lastDv, 'last-id-in-dv': lastIdInDv },
                    {},
                );

                const irrelevantEntities =
                    res1.extensions.irrelevantEntities.onlinePaginatedAuthors;
                expect(irrelevantEntities.length).toEqual(2);
            });
        },
    );
    test.each(createServers())(
        'fetch authors, fetch two consecutive pages with same data version, return correctly',
        async (server) => {
            await polarisTest(server, async () => {
                await graphqlRawRequest(createManyAuthors.request, {}, {});
                const firstFour = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 4, 'data-version': 1 },
                    {},
                );
                const firstFourAuthors = firstFour.data.onlinePaginatedAuthors;
                const firstTwo = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'page-size': 2, 'data-version': 1 },
                    {},
                );
                const lastIdInDv = firstTwo.extensions.lastIdInDataVersion;
                const lastDv = firstTwo.extensions.lastDataVersionInPage;
                const firstTwoAuthors = firstTwo.data.onlinePaginatedAuthors;
                const nextTwo = await graphqlRawRequest(
                    onlinePaginatedAuthors.requestBooksWithoutChapters,
                    { 'last-id-in-dv': lastIdInDv, 'page-size': 2, 'data-version': lastDv },
                    {},
                );
                const nextTwoAuthors = nextTwo.data.onlinePaginatedAuthors;
                for (const author of [...firstTwoAuthors, ...nextTwoAuthors]) {
                    expect(firstFourAuthors).toContainEqual(author);
                }
            });
        },
    );
});
