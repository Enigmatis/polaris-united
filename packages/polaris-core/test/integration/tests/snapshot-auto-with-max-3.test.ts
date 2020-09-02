import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import { waitUntilSnapshotRequestIsDone } from '../server/utils/snapshot-client';
import * as allBooksPaginated from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

let polarisServer: PolarisServer;
beforeEach(async () => {
    polarisServer = await startTestServer({
        snapshotConfig: {
            autoSnapshot: true,
            maxPageSize: 3,
            snapshotCleaningInterval: 1000,
            secondsToBeOutdated: 60,
            entitiesAmountPerFetch: 50,
        },
    });
    await graphQLRequest(createBook.request, {}, { title: 'book01' });
    await graphQLRequest(createBook.request, {}, { title: 'book02' });
});
afterEach(async () => {
    await stopTestServer(polarisServer);
});

describe('snapshot pagination tests with auto enabled', () => {
    describe('max page size is 3', () => {
        describe('snap request is true', () => {
            it('should not paginate if total count is smaller than minimal page size', async () => {
                const paginatedResult: any = await graphqlRawRequest(allBooksPaginated.request, {
                    ...allBooksPaginated.headers,
                    'snap-page-size': 10,
                });
                const snapResponse = paginatedResult.extensions.snapResponse;
                expect(snapResponse).toBeUndefined();
                expect(paginatedResult.data.allBooksPaginated.length).toBe(2);
            });
        });
        describe('snap request is false', () => {
            it('should paginate if total count is larger than minimal page size', async () => {
                const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                    ...allBooksPaginated.headers,
                    'snap-request': false,
                    'snap-page-size': 1,
                });
                const pageIds = paginatedResult.extensions.snapResponse.pagesIds;
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    1000,
                );
                expect(pageIds.length).toBe(2);
            });

            it('should not paginate if total count is smaller than minimal page size', async () => {
                const paginatedResult: any = await graphqlRawRequest(allBooksPaginated.request, {
                    ...allBooksPaginated.headers,
                    'snap-request': false,
                    'snap-page-size': 10,
                });
                const snapResponse = paginatedResult.extensions.snapResponse;
                expect(snapResponse).toBeUndefined();
                expect(paginatedResult.data.allBooksPaginated.length).toBe(2);
            });
        });
    });
});
