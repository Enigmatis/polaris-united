import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(() => {
    return stopTestServer(polarisServer);
});

describe('simple queries', () => {
    it('all entities query', async () => {
        await graphQLRequest(createBook.request, undefined, {
            title: 'book',
        });
        await graphQLRequest(createBook.request, undefined, {
            title: 'book2',
        });
        const result: any = await graphQLRequest(allBooks.request, undefined);
        expect(result.allBooks[0].title).toEqual('book');
        expect(result.allBooks[1].title).toEqual('book2');
    });

    it('query with arguments', async () => {
        await graphQLRequest(createBook.request, undefined, {
            title: 'book3',
        });
        const result: any = await graphQLRequest(booksByTitle.request, undefined, { title: '3' });
        expect(result.bookByTitle[0].title).toEqual('book3');
    });
});
