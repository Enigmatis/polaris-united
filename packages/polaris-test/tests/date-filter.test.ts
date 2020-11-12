import { createServers } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';
import { graphQLRequest } from '../test-utils/graphql-client';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as bookByDate from './jsonRequestsAndHeaders/booksByDate.json';
import * as createBookWithCreationTime from './jsonRequestsAndHeaders/createBookWithCreationTime.json';
import * as updateBooksByTitle from './jsonRequestsAndHeaders/updateBooksByTitle.json';

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDateTwoYearsAhead(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date;
}

describe('date filter tests', () => {
    describe('creation time tests', () => {
        test.each(createServers())(
            'fetch books by date filter, books fetched successfully',
            async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    const dateTwoYearsAhead = getDateTwoYearsAhead();
                    const book2 = await graphQLRequest(
                        createBookWithCreationTime.request,
                        {},
                        { title: 'book2', creationTime: dateTwoYearsAhead.toISOString() },
                    );
                    const response = await graphQLRequest(
                        bookByDate.request,
                        {},
                        {
                            filter: {
                                creationTime: {
                                    gt: `${dateTwoYearsAhead.getFullYear() - 1}-01-01`,
                                },
                            },
                        },
                    );
                    expect(response.bookByDate.length).toEqual(1);
                    expect(response.bookByDate[0].title).toEqual(
                        book2.createBookWithCreationDate.title,
                    );
                });
            },
        );
        test.each(createServers())(
            'fetch books by date filter, books fetched successfully',
            async (server) => {
                await polarisTest(server, async () => {
                    const book1 = await graphQLRequest(createBook.request, {}, { title: 'book1' });
                    const dateTwoYearsAhead = getDateTwoYearsAhead();
                    await graphQLRequest(
                        createBookWithCreationTime.request,
                        {},
                        { title: 'book2', creationTime: dateTwoYearsAhead.toISOString() },
                    );
                    const response = await graphQLRequest(
                        bookByDate.request,
                        {},
                        {
                            filter: {
                                creationTime: {
                                    lt: `${dateTwoYearsAhead.getFullYear() - 1}-01-01`,
                                },
                            },
                        },
                    );
                    expect(response.bookByDate.length).toEqual(1);
                    expect(response.bookByDate[0].title).toEqual(book1.createBook.title);
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
                    const fromDate = new Date();
                    await sleep(5000);
                    const updatedBook = await graphQLRequest(
                        updateBooksByTitle.request,
                        {},
                        { title: 'book1', newTitle: 'newBook1' },
                    );
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
                    const fromDate = new Date();
                    await sleep(5000);
                    const updatedBook = await graphQLRequest(
                        updateBooksByTitle.request,
                        {},
                        { title: 'book1', newTitle: 'newBook1' },
                    );
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
});
