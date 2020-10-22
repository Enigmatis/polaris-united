import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as deleteBook from './jsonRequestsAndHeaders/deleteBook.json';
import * as updateBooksByTitle from './jsonRequestsAndHeaders/updateBooksByTitle.json';
import { polarisTest } from '../test-utils/polaris-test';

const title = 'the bible';
const title2 = 'harry potter';
const newTitle = 'a song of ice and fire';
describe('irrelevant entities in response', () => {
    test.each(createServers())(
        'delete book that answered criteria, get it in irrelevant entities',
        async (server) => {
            await polarisTest(server, async () => {
                const res: any = await graphQLRequest(createBook.request, undefined, { title });
                await graphQLRequest(deleteBook.request, {}, { id: res.createBook.id });
                const result: any = await graphqlRawRequest(
                    booksByTitle.request,
                    { 'data-version': 1 },
                    { title },
                );
                expect(result.extensions.irrelevantEntities.bookByTitle).toContain(
                    res.createBook.id,
                );
            });
        },
    );
    test.each(createServers())(
        'delete book that never answered criteria, get it in irrelevant entities',
        async (server) => {
            await polarisTest(server, async () => {
                const res: any = await graphQLRequest(createBook.request, {}, { title: title2 });
                await graphQLRequest(deleteBook.request, {}, { id: res.createBook.id });
                const result: any = await graphqlRawRequest(
                    booksByTitle.request,
                    { 'data-version': 1 },
                    { title },
                );
                expect(result.extensions.irrelevantEntities.bookByTitle).toContain(
                    res.createBook.id,
                );
            });
        },
    );
    test.each(createServers())(
        'update book that never answered criteria, get it in irrelevant entities',
        async (server) => {
            await polarisTest(server, async () => {
                const res: any = await graphQLRequest(createBook.request, {}, { title: title2 });
                await graphQLRequest(
                    updateBooksByTitle.request,
                    {},
                    { title: title2, newTitle: 'book2' },
                );
                const result: any = await graphqlRawRequest(
                    booksByTitle.request,
                    { 'data-version': 1 },
                    { title },
                );
                expect(result.extensions.irrelevantEntities.bookByTitle).toContain(
                    res.createBook.id,
                );
            });
        },
    );
    test.each(createServers())(
        'update book that answered criteria, get it in irrelevant entities',
        async (server) => {
            await polarisTest(server, async () => {
                const res: any = await graphQLRequest(createBook.request, {}, { title });
                await graphQLRequest(updateBooksByTitle.request, {}, { title, newTitle });
                const result: any = await graphqlRawRequest(
                    booksByTitle.request,
                    { 'data-version': 1 },
                    { title },
                );
                expect(result.extensions.irrelevantEntities.bookByTitle).toContain(
                    res.createBook.id,
                );
            });
        },
    );
    test.each(createServers())(
        'should not get irrelevant entities if no data version in headers',
        async (server) => {
            await polarisTest(server, async () => {
                await graphQLRequest(createBook.request, {}, { title });
                await graphQLRequest(updateBooksByTitle.request, {}, { title, newTitle });
                const result: any = await graphqlRawRequest(booksByTitle.request, {}, { title });
                expect(result.extensions.irrelevantEntities).toBeUndefined();
            });
        },
    );
    test.each(createServers())(
        'should place irrelevant response in the specific field info',
        async (server) => {
            await polarisTest(server, async () => {
                const res: any = await graphQLRequest(createBook.request, {}, { title });
                await graphQLRequest(updateBooksByTitle.request, {}, { title, newTitle });
                const result: any = await graphqlRawRequest(
                    booksByTitle.twoRequests,
                    { 'data-version': 1 },
                    { title, title2: title },
                );
                expect(result.extensions.irrelevantEntities.a).toBeDefined();
                expect(result.extensions.irrelevantEntities.b).toBeDefined();
                expect(result.extensions.irrelevantEntities.a).toContain(res.createBook.id);
                expect(result.extensions.irrelevantEntities.b).toContain(res.createBook.id);
            });
        },
    );
});
