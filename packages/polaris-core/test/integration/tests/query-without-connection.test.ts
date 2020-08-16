import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server-without-connection/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as allBooksNoConnection from './jsonRequestsAndHeaders/allBooksNoConnection.json';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(async () => {
    return stopTestServer(polarisServer);
});

describe('simple queries without connection', () => {
    it('all entities query', async () => {
        const result: any = await graphQLRequest(allBooksNoConnection.request, {});
        expect(result.allBooks[0].title).toEqual('Book1');
        expect(result.allBooks[1].title).toEqual('Book2');
    });

    it('query with arguments', async () => {
        const title = 'Book3';
        const result: any = await graphQLRequest(booksByTitle.request, {}, { title });
        expect(result.bookByTitle[0].title).toEqual(title);
    });
});
