import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as mutation from './jsonRequestsAndHeaders/mutation.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(async () => {
    await stopTestServer(polarisServer);
});

describe('data version tests', () => {
    describe('data version in response', () => {
        it('should return the data version in response', async () => {
            const response = await graphqlRawRequest(allBooks.request, undefined);
            expect(response.extensions.globalDataVersion).toBeDefined();
            expect(response.extensions.globalDataVersion).toEqual(1);
        });
        it('should increment the data version on db updates', async () => {
            const allBooks2: any = await graphqlRawRequest(allBooks.request, undefined);
            const dataVersionBeforeUpdate = allBooks2.extensions.globalDataVersion;
            await graphqlRawRequest(mutation.request, mutation.headers, {
                firstName: 'Amos',
                lastName: 'Oz',
            });
            const x: any = await graphqlRawRequest(allBooks.request, undefined);
            const dataVersionAfterUpdate = x.extensions.globalDataVersion;
            expect(dataVersionAfterUpdate - 1).toEqual(dataVersionBeforeUpdate);
        });
        it('should increment only once for the same context', async () => {
            const books: any = await graphqlRawRequest(allBooks.request, undefined);
            const dataVersionBeforeUpdate = books.extensions.globalDataVersion;
            await graphqlRawRequest(mutation.requestTwo, mutation.headers, {
                firstName: 'Amos',
                lastName: 'Oz',
            });
            const books2: any = await graphqlRawRequest(allBooks.request, undefined);
            const dataVersionAfterUpdate = books2.extensions.globalDataVersion;
            expect(dataVersionAfterUpdate - 1).toEqual(dataVersionBeforeUpdate);
        });
    });
    describe('data version filtering', () => {
        it('should filter entities below the requested data version', async () => {
            await graphqlRawRequest(createBook.request, undefined, {
                title: 'book',
            });
            await graphqlRawRequest(createBook.request, undefined, {
                title: 'book2',
            });
            const response: any = await graphQLRequest(allBooks.request, {
                'data-version': 2,
            });

            expect(response.allBooks.length).toEqual(1);
            expect(response.allBooks[0].title).toEqual('book2');
        });
    });
});
