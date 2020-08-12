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

describe('soft delete tests', () => {
    it('should filter deleted entities', async () => {
        await graphQLRequest(createBook.request, undefined, {
            title: 'Book4',
        });
        const bookDeletionCriteria = {
            title: '4',
        };
        const bookToDelete: any = await graphQLRequest(
            booksByTitle.request,
            undefined,
            bookDeletionCriteria,
        );
        await graphQLRequest(deleteBook.request, deleteBook.headers, {
            id: bookToDelete.bookByTitle[0].id,
        });
        const afterBookDeletionResponse: any = await graphQLRequest(
            booksByTitle.request,
            undefined,
            bookDeletionCriteria,
        );
        expect(afterBookDeletionResponse.bookByTitle.length).toBe(0);
    });

    it('should delete linked entities to deleted entities', async () => {
        const author: any = await graphQLRequest(createAuthor.request, undefined, {
            firstName: 'Author1',
            lastName: 'Author1',
        });
        await graphQLRequest(createBook.request, undefined, {
            title: 'Book1',
            authorId: author.createAuthor.id,
        });
        await graphQLRequest(deleteAuthor.request, deleteAuthor.headers, {
            id: author.createAuthor.id,
        });
        const afterBookDeletionResponse: any = await graphQLRequest(
            booksByTitle.request,
            undefined,
            { title: '1' },
        );
        expect(afterBookDeletionResponse.bookByTitle.length).toBe(0);
    });
});
