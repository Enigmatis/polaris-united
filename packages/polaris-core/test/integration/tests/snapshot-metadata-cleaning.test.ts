import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import { metadataRequest } from '../server/utils/snapshot-client';
import * as paginatedQuery from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

let polarisServer: PolarisServer;
beforeEach(async () => {
    polarisServer = await startTestServer({
        snapshotConfig: {
            autoSnapshot: false,
            maxPageSize: 3,
            snapshotCleaningInterval: 5,
            secondsToBeOutdated: 5,
            entitiesAmountPerFetch: 50,
        },
    });
    await graphQLRequest(createBook.request, undefined, {
        title: 'book',
    });
});
afterEach(async () => {
    await stopTestServer(polarisServer);
});

describe('snapshot metadata cleaned every interval', () => {
    it('should remove expired metadata', async () => {
        const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
            ...paginatedQuery.headers,
        });
        const snapshotMetadataId = paginatedResult.extensions.snapResponse.snapshotMetadataId;
        await sleep(11000);
        const metadataResponse = await metadataRequest(snapshotMetadataId);
        expect(metadataResponse.data).toBe('');

        function sleep(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    });
});
