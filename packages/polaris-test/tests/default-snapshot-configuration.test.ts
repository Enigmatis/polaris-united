import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import {
    metadataRequest,
    snapshotRequest,
    waitUntilSnapshotRequestIsDone,
} from '../test-utils/snapshot-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooksPaginated from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

describe('snapshot pagination tests with default configuration', () => {
    describe('snap request is false', () => {
        test.each(createServers())('should not paginate', async (server) => {
            await server.start();
            await graphQLRequest(createBook.request, {}, { title: 'book01' });
            await graphQLRequest(createBook.request, {}, { title: 'book02' });
            const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                ...allBooksPaginated.headers,
                'snap-request': false,
            });
            const snapResponse = paginatedResult.extensions.snapResponse;
            expect(snapResponse).toBeUndefined();
            expect(paginatedResult.data.allBooksPaginated.length).toBe(2);
            await server.stop();
        });
    });
    describe('snap request is true', () => {
        test.each(createServers())('correct extensions in response', async (server) => {
            await server.start();
            await graphQLRequest(createBook.request, {}, { title: 'book01' });
            await graphQLRequest(createBook.request, {}, { title: 'book02' });
            const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                'snap-request': true,
            });
            const pageIds = paginatedResult.extensions.snapResponse.pagesIds;
            const snapshotMetadataId = paginatedResult.extensions.snapResponse.snapshotMetadataId;
            await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 1000);
            const firstPage = await snapshotRequest(pageIds[0]);
            const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
            expect(pageIds.length).toBe(1);
            expect(paginatedResult.data).toEqual({});
            expect(paginatedResult.extensions.prefetchBuffer).toBeUndefined();
            expect(firstPage.data.extensions.snapResponse).toBeUndefined();
            expect(snapshotMetadata.currentPageIndex).toBeUndefined();
            expect(snapshotMetadata.irrelevantEntities).toBeUndefined();
            expect(snapshotMetadata.warnings).toBeUndefined();
            expect(snapshotMetadata.errors).toBeUndefined();
            await server.stop();
        });
    });
});
