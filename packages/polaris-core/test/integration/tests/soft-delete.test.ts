import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as deleteAuthor from './jsonRequestsAndHeaders/deleteAuthor.json';
import * as deleteBook from './jsonRequestsAndHeaders/deleteBook.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(async () => {
    await stopTestServer(polarisServer);
});
const title = 'Book4';
const name = { firstName: 'Author1', lastName: 'Author1' };
describe('soft delete tests', () => {
    it('should filter deleted entities', async () => {
        await graphQLRequest(createBook.request, {}, { title });
        const bookToDelete: any = await graphQLRequest(booksByTitle.request, {}, { title });
        await graphQLRequest(deleteBook.request, deleteBook.headers, {
            id: bookToDelete.bookByTitle[0].id,
        });
        const afterBookDeletionResponse: any = await graphQLRequest(
            booksByTitle.request,
            {},
            { title },
        );
        expect(afterBookDeletionResponse.bookByTitle.length).toBe(0);
    });

    it('should delete linked entities to deleted entities', async () => {
        const author: any = await graphQLRequest(createAuthor.request, {}, name);
        await graphQLRequest(createBook.request, {}, { title, authorId: author.createAuthor.id });
        await graphQLRequest(deleteAuthor.request, deleteAuthor.headers, {
            id: author.createAuthor.id,
        });
        const afterBookDeletionResponse: any = await graphQLRequest(
            booksByTitle.request,
            {},
            { title: '1' },
        );
        expect(afterBookDeletionResponse.bookByTitle.length).toBe(0);
    });
});
