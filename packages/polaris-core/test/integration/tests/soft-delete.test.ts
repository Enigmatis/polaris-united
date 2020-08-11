import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';
import * as deleteAuthor from './jsonRequestsAndHeaders/deleteAuthor.json';
import * as deleteBook from './jsonRequestsAndHeaders/deleteBook.json';
import * as authorsByName from './jsonRequestsAndHeaders/queryAuthorsByName.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(async () => {
    await stopTestServer(polarisServer);
});

describe('soft delete tests', () => {
    it('should filter deleted entities', async () => {
        const bookDeletionCriteria = {
            title: '4',
        };
        const bookToDelete: any = await graphQLRequest(
            booksByTitle.request,
            { 'reality-id': 3 },
            bookDeletionCriteria,
        );
        await graphQLRequest(deleteBook.request, deleteBook.headers, {
            id: bookToDelete.bookByTitle[0].id,
        });
        const afterBookDeletionResponse: any = await graphQLRequest(
            booksByTitle.request,
            { 'reality-id': 3 },
            bookDeletionCriteria,
        );
        expect(afterBookDeletionResponse.bookByTitle.length).toBe(0);
    });

    it('should delete linked entities to deleted entities', async () => {
        const authorDeletionCriteria = {
            name: '1',
        };

        const bookDeletionCriteria = {
            title: '1',
        };

        const authorToDelete: any = await graphQLRequest(
            authorsByName.request,
            authorsByName.headers,
            authorDeletionCriteria,
        );
        await graphQLRequest(deleteAuthor.request, deleteAuthor.headers, {
            id: authorToDelete.authorsByName[0].id,
        });
        const afterBookDeletionResponse: any = await graphQLRequest(
            booksByTitle.request,
            { 'reality-id': 3 },
            bookDeletionCriteria,
        );
        expect(afterBookDeletionResponse.bookByTitle.length).toBe(0);
    });
});
