import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as deleteBook from './jsonRequestsAndHeaders/deleteBook.json';
import * as updateBooksByTitle from './jsonRequestsAndHeaders/updateBooksByTitle.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(() => {
    return stopTestServer(polarisServer);
});
const title = 'the bible';
const title2 = 'harry potter';
const newTitle = 'a song of ice and fire';
describe('irrelevant entities in response', () => {
    it('delete book that answered criteria, get it in irrelevant entities', async () => {
        const res: any = await graphQLRequest(createBook.request, undefined, { title });
        await graphQLRequest(deleteBook.request, {}, { id: res.createBook.id });
        const result: any = await graphqlRawRequest(
            booksByTitle.request,
            { 'data-version': 1 },
            { title },
        );
        expect(result.extensions.irrelevantEntities.bookByTitle).toContain(res.createBook.id);
    });
    it('delete book that never answered criteria, get it in irrelevant entities', async () => {
        const res: any = await graphQLRequest(createBook.request, {}, { title: title2 });
        await graphQLRequest(deleteBook.request, {}, { id: res.createBook.id });
        const result: any = await graphqlRawRequest(
            booksByTitle.request,
            { 'data-version': 1 },
            { title },
        );
        expect(result.extensions.irrelevantEntities.bookByTitle).toContain(res.createBook.id);
    });
    it('update book that never answered criteria, get it in irrelevant entities', async () => {
        const res: any = await graphQLRequest(createBook.request, {}, { title: title2 });
        await graphQLRequest(updateBooksByTitle.request, {}, { title: title2, newTitle: 'book2' });
        const result: any = await graphqlRawRequest(
            booksByTitle.request,
            { 'data-version': 1 },
            { title },
        );
        expect(result.extensions.irrelevantEntities.bookByTitle).toContain(res.createBook.id);
    });
    it('update book that answered criteria, get it in irrelevant entities', async () => {
        const res: any = await graphQLRequest(createBook.request, {}, { title });
        await graphQLRequest(updateBooksByTitle.request, {}, { title, newTitle });
        const result: any = await graphqlRawRequest(
            booksByTitle.request,
            { 'data-version': 1 },
            { title },
        );
        expect(result.extensions.irrelevantEntities.bookByTitle).toContain(res.createBook.id);
    });

    it('should not get irrelevant entities if no data version in headers', async () => {
        await graphQLRequest(createBook.request, {}, { title });
        await graphQLRequest(updateBooksByTitle.request, {}, { title, newTitle });
        const result: any = await graphqlRawRequest(booksByTitle.request, {}, { title });
        expect(result.extensions.irrelevantEntities).toBeUndefined();
    });

    it('should place irrelevant response in the specific field info', async () => {
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
});
