import { createServers, createServersWithoutNestServer } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';
import { graphQLRequest } from '../test-utils/graphql-client';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as bookByDate from './jsonRequestsAndHeaders/booksByDate.json';
import * as updateBooksByTitle from './jsonRequestsAndHeaders/updateBooksByTitle.json';
import * as multipleQueriesAndSomeWithDateFilter from './jsonRequestsAndHeaders/multipleQueriesAndSomeWithDateFilter.json';
import * as multipleQueriesWithDatesFilter from './jsonRequestsAndHeaders/multipleQueriesWithDatesFilter.json';

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe.skip('date filter tests', () => {
    describe('creation time tests', () => {
        test.each(createServers())(
            'fetch books by date filter, books fetched successfully',
            async (server) => {
                await polarisTest(server, async () => {
                    const fromDate = new Date();
                    fromDate.setFullYear(fromDate.getFullYear() - 1);
                    await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    const response = await graphQLRequest(
                        bookByDate.request,
                        {},
                        {
                            filter: {
                                creationTime: {
                                    gt: fromDate,
                                },
                            },
                        },
                    );
                    const titles = response.bookByDate.map((x: any) => x.title);
                    expect(response.bookByDate.length).toEqual(2);
                    expect(titles).toContain('book1');
                    expect(titles).toContain('book2');
                });
            },
        );
        test.each(createServers())(
            'fetch books by date filter, books fetched successfully',
            async (server) => {
                await polarisTest(server, async () => {
                    const fromDate = new Date();
                    fromDate.setFullYear(fromDate.getFullYear() + 1);
                    await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    const response = await graphQLRequest(
                        bookByDate.request,
                        {},
                        {
                            filter: {
                                creationTime: {
                                    gt: fromDate,
                                },
                            },
                        },
                    );
                    const titles = response.bookByDate.map((x: any) => x.title);
                    expect(response.bookByDate.length).toEqual(0);
                    expect(titles).not.toContain('book1');
                    expect(titles).not.toContain('book2');
                });
            },
        );
        test.each(createServers())(
            'fetch books by date filter, books fetched successfully',
            async (server) => {
                await polarisTest(server, async () => {
                    const fromDate = new Date();
                    fromDate.setFullYear(fromDate.getFullYear() + 1);
                    await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    const response = await graphQLRequest(
                        bookByDate.request,
                        {},
                        {
                            filter: {
                                creationTime: {
                                    lt: fromDate,
                                },
                            },
                        },
                    );
                    const titles = response.bookByDate.map((x: any) => x.title);
                    expect(response.bookByDate.length).toEqual(2);
                    expect(titles).toContain('book1');
                    expect(titles).toContain('book2');
                });
            },
        );
        test.each(createServers())(
            'fetch books by date filter, books fetched successfully',
            async (server) => {
                await polarisTest(server, async () => {
                    const fromDate = new Date();
                    fromDate.setFullYear(fromDate.getFullYear() - 1);
                    await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    const response = await graphQLRequest(
                        bookByDate.request,
                        {},
                        {
                            filter: {
                                creationTime: {
                                    lt: fromDate,
                                },
                            },
                        },
                    );
                    const titles = response.bookByDate.map((x: any) => x.title);
                    expect(response.bookByDate.length).toEqual(0);
                    expect(titles).not.toContain('book1');
                    expect(titles).not.toContain('book2');
                });
            },
        );
    });
    describe('last updated time tests', () => {
        test.each(createServers())(
            'fetch books by date filter, books fetched successfully',
            async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    await sleep(1500);
                    const fromDate = new Date();
                    await sleep(1500);
                    const updatedBook = await graphQLRequest(
                        updateBooksByTitle.request,
                        {},
                        { title: 'book1', newTitle: 'newBook1' },
                    );
                    await sleep(1500);
                    const toDate = new Date();
                    const response = await graphQLRequest(
                        bookByDate.request,
                        {},
                        {
                            filter: {
                                lastUpdateTime: {
                                    gte: fromDate.toISOString(),
                                    lte: toDate.toISOString(),
                                },
                            },
                        },
                    );
                    expect(response.bookByDate.length).toEqual(1);
                    expect(response.bookByDate[0].title).toEqual(
                        updatedBook.updateBooksByTitle[0].title,
                    );
                });
            },
        );
        test.each(createServers())(
            'fetch books by date filter, books fetched successfully',
            async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    await sleep(1500);
                    const fromDate = new Date();
                    await sleep(1500);
                    const updatedBook = await graphQLRequest(
                        updateBooksByTitle.request,
                        {},
                        { title: 'book1', newTitle: 'newBook1' },
                    );
                    await sleep(1500);
                    const toDate = new Date();
                    const response = await graphQLRequest(
                        bookByDate.request,
                        {},
                        {
                            filter: {
                                lastUpdateTime: {
                                    gt: fromDate.toISOString(),
                                    lt: toDate.toISOString(),
                                },
                            },
                        },
                    );
                    expect(response.bookByDate.length).toEqual(1);
                    expect(response.bookByDate[0].title).toEqual(
                        updatedBook.updateBooksByTitle[0].title,
                    );
                });
            },
        );
    });
    describe('multiple queries with filter dates', () => {
        test.each(createServersWithoutNestServer())(
            'execute multiple queries in the same request, execution executed successfully for each query',
            async (server) => {
                await polarisTest(server, async () => {
                    const fromDate = new Date();
                    fromDate.setFullYear(fromDate.getFullYear() + 1);
                    await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    const response = await graphQLRequest(
                        multipleQueriesAndSomeWithDateFilter.request,
                        {},
                        {
                            filter1: {
                                creationTime: {
                                    gt: fromDate,
                                },
                            },
                            filter2: {
                                creationTime: {
                                    lt: fromDate,
                                },
                            },
                            title: 'book1',
                        },
                    );
                    expect(response.a.length).toEqual(0);
                    expect(response.b.length).toEqual(2);
                    expect(response.c.length).toEqual(2);
                    expect(response.d.length).toEqual(1);
                });
            },
        );
        test.each(createServersWithoutNestServer())(
            'execute multiple dates filter queries in the same request, execution executed successfully for each query',
            async (server) => {
                await polarisTest(server, async () => {
                    const fromDate = new Date();
                    fromDate.setFullYear(fromDate.getFullYear() + 1);
                    await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    const response = await graphQLRequest(
                        multipleQueriesWithDatesFilter.request,
                        {},
                        {
                            filter1: {
                                creationTime: {
                                    gt: fromDate,
                                },
                            },
                            filter2: {
                                creationTime: {
                                    lt: fromDate,
                                },
                            },
                        },
                    );
                    const titlesA = response.a.map((x: any) => x.title);
                    const titlesB = response.b.map((x: any) => x.title);
                    expect(response.a.length).toEqual(0);
                    expect(titlesA).not.toContain('book1');
                    expect(titlesA).not.toContain('book2');
                    expect(response.b.length).toEqual(2);
                    expect(titlesB).toContain('book1');
                    expect(titlesB).toContain('book2');
                });
            },
        );
    });
});
