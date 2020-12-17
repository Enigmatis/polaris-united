import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { metadataRequest, waitUntilSnapshotRequestIsDone } from '../test-utils/snapshot-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooksPaginated from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import { polarisTest } from '../test-utils/polaris-test';

const config: Partial<PolarisServerOptions> = {
    maxPageSize: 1,
    snapshotConfig: {
        autoSnapshot: true,
        snapshotCleaningInterval: 1000,
        secondsToBeOutdated: 60,
        entitiesAmountPerFetch: 50,
    },
};

describe('snapshot pagination tests with auto enabled', () => {
    describe('max page size is 1', () => {
        describe('snap request is false', () => {
            test.each(createServers(config))('should paginated anyway', async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'book01' });
                    await graphQLRequest(createBook.request, {}, { title: 'book02' });
                    const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                        ...allBooksPaginated.headers,
                        'snap-request': false,
                    });
                    const snapshotMetadataId =
                        paginatedResult.extensions.snapResponse.snapshotMetadataId;
                    await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 1000);
                    const snapshotMetadata = (await metadataRequest(snapshotMetadataId)).data;
                    expect(snapshotMetadata.pagesIds.length).toBe(2);
                });
            });
            test.each(createServers(config))(
                'should paginated according to minimal snap page size provided',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: 'book01' });
                        await graphQLRequest(createBook.request, {}, { title: 'book02' });
                        const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                            ...allBooksPaginated.headers,
                            'snap-request': false,
                            'snap-page-size': 10,
                        });
                        const snapshotMetadataId =
                            paginatedResult.extensions.snapResponse.snapshotMetadataId;
                        await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 1000);
                        const snapshotMetadata = (await metadataRequest(snapshotMetadataId)).data;
                        expect(snapshotMetadata.pagesIds.length).toBe(2);
                    });
                },
            );
        });
    });
});
