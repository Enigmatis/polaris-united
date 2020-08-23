import { PolarisServer } from '../../../src';
import { allBooksNoConnectionData } from '../server-without-connection/schema/resolvers';
import { startTestServer, stopTestServer } from '../server-without-connection/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooksNoConnection.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(async () => {
    return stopTestServer(polarisServer);
});

describe('directives tests', () => {
    it('query a field with directive, directive logic activated', async () => {
        const result: any = await graphQLRequest(allBooks.request);
        expect(result.allBooks[0].coverColor).toEqual(
            allBooksNoConnectionData[0].coverColor.toUpperCase(),
        );
        expect(result.allBooks[1].coverColor).toEqual(
            allBooksNoConnectionData[1].coverColor.toUpperCase(),
        );
        expect(result.allBooks[2].coverColor).toEqual(
            allBooksNoConnectionData[2].coverColor.toUpperCase(),
        );
    });
});
