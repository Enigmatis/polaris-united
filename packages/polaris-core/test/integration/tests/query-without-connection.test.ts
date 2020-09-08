import { PolarisServer } from '../../../src';
import { allBooksNoConnectionData } from '../server-without-connection/schema/resolvers';
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
        const result: any = await graphQLRequest(allBooksNoConnection.request);
        expect(result.allBooks[0].title).toEqual(allBooksNoConnectionData[0].title);
        expect(result.allBooks[1].title).toEqual(allBooksNoConnectionData[1].title);
    });

    it('query with arguments', async () => {
        const title = allBooksNoConnectionData[2].title;
        const result: any = await graphQLRequest(booksByTitle.request, {}, { title });
        expect(result.bookByTitle[0].title).toEqual(title);
    });
});
