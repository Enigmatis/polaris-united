import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { metadataRequest, waitUntilSnapshotRequestIsDone } from '../test-utils/snapshot-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as paginatedQuery from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import { polarisTest } from '../test-utils/polaris-test';

const config: Partial<PolarisServerOptions> = {
    maxPageSize: 3,
    snapshotConfig: {
        autoSnapshot: false,
        snapshotCleaningInterval: 5,
        secondsToBeOutdated: 5,
        entitiesAmountPerFetch: 50,
    },
};

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('snapshot metadata cleaned every interval', () => {
    test.each(createServers(config))('should remove expired metadata', async (server) => {
        await polarisTest(server, async () => {
            await graphQLRequest(createBook.request, {}, { title: 'book' });

            const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                ...paginatedQuery.headers,
            });
            const snapshotMetadataId = paginatedResult.extensions.snapResponse.snapshotMetadataId;
            await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 1000);
            await sleep(11000);
            const metadataResponse = await metadataRequest(snapshotMetadataId);
            expect(metadataResponse.data.message).toBe(
                `Snapshot metadata with id ${snapshotMetadataId} not found`,
            );
        });
    });
});
