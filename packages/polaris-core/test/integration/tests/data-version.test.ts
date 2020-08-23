import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

let polarisServer: PolarisServer;
const authorName = { firstName: 'Amos', lastName: 'Oz' };

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(async () => {
    await stopTestServer(polarisServer);
});

describe('data version tests', () => {
    describe('data version in response', () => {
        it('should return the data version in response', async () => {
            const response = await graphqlRawRequest(allBooks.request);
            expect(response.extensions.globalDataVersion).toBeDefined();
            expect(response.extensions.globalDataVersion).toEqual(1);
        });
        it('should increment the data version on db updates', async () => {
            const response: any = await graphqlRawRequest(allBooks.request);
            const dataVersionBeforeUpdate = response.extensions.globalDataVersion;
            await graphqlRawRequest(createAuthor.request, {}, authorName);
            const x: any = await graphqlRawRequest(allBooks.request);
            const dataVersionAfterUpdate = x.extensions.globalDataVersion;
            expect(dataVersionAfterUpdate - 1).toEqual(dataVersionBeforeUpdate);
        });
        it('should increment only once for the same context', async () => {
            const books: any = await graphqlRawRequest(allBooks.request);
            const dataVersionBeforeUpdate = books.extensions.globalDataVersion;
            await graphQLRequest(createAuthor.requestTwo, {}, authorName);
            const books2: any = await graphqlRawRequest(allBooks.request);
            const dataVersionAfterUpdate = books2.extensions.globalDataVersion;
            expect(dataVersionAfterUpdate - 1).toEqual(dataVersionBeforeUpdate);
        });
    });
    describe('data version filtering', () => {
        it('should filter entities below the requested data version', async () => {
            await graphQLRequest(createBook.request, {}, { title: 'book' });
            await graphQLRequest(createBook.request, {}, { title: 'book2' });
            const response: any = await graphQLRequest(allBooks.request, { 'data-version': 2 });
            expect(response.allBooks.length).toEqual(1);
            expect(response.allBooks[0].title).toEqual('book2');
        });
    });
});
