import { PolarisServerOptions, SnapshotStatus } from '@enigmatis/polaris-core';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { polarisTest } from '../test-utils/polaris-test';
import {
    metadataRequest,
    snapshotRequest,
    waitUntilSnapshotRequestIsDone,
} from '../test-utils/snapshot-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as paginatedQuery from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

const config: Partial<PolarisServerOptions> = {
    snapshotConfig: {
        autoSnapshot: true,
        maxPageSize: 3,
        snapshotCleaningInterval: 60,
        secondsToBeOutdated: 60,
        entitiesAmountPerFetch: 50,
    },
};

describe('snapshot metadata is generated running snapshot pagination', () => {
    describe('snapshot metadata is returned upon request', () => {
        test.each(createServers(config))(
            'will generate metadata and return it when requested',
            async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'book' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                        ...paginatedQuery.headers,
                    });
                    const snapshotMetadataId =
                        paginatedResult.extensions.snapResponse.snapshotMetadataId;
                    await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 500);
                    const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
                    expect(snapshotMetadata.id).toBe(snapshotMetadataId);
                    expect(snapshotMetadata.pagesCount).toBe(2);
                    expect(snapshotMetadata.status).toBe(SnapshotStatus.DONE);
                });
            },
        );
    });

    describe('page generation will occur even after initial request ends', () => {
        test.each(createServers(config))(
            'returns IN_PROGRESS as status if pagination not ended yet',
            async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'book' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                        ...paginatedQuery.headers,
                    });
                    const snapshotMetadataId =
                        paginatedResult.extensions.snapResponse.snapshotMetadataId;
                    const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
                    await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 500);
                    expect(snapshotMetadata.status).toBe(SnapshotStatus.IN_PROGRESS);
                });
            },
        );
        test.each(createServers(config))(
            'not completed pages will return status in_progress',
            async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'book' });
                    await graphQLRequest(createBook.request, {}, { title: 'book2' });
                    const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                        ...paginatedQuery.headers,
                    });
                    const secondPageId = paginatedResult.extensions.snapResponse.pagesIds[1];
                    const snapshotPage: any = (await snapshotRequest(secondPageId)).data;
                    await waitUntilSnapshotRequestIsDone(
                        paginatedResult.extensions.snapResponse.snapshotMetadataId,
                        500,
                    );
                    expect(snapshotPage.status).toBe(SnapshotStatus.IN_PROGRESS);
                });
            },
        );

        describe('page generation will occur even after initial request ends', () => {
            test.each(createServers(config))(
                'exception thrown in resolver, pages will return status failed',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: 'book' });
                        await graphQLRequest(createBook.request, {}, { title: 'book2' });
                        const paginatedResult = await graphqlRawRequest(
                            paginatedQuery.failedRequest,
                            {
                                ...paginatedQuery.headers,
                            },
                        );
                        const { snapshotMetadataId } = paginatedResult.extensions.snapResponse;
                        const secondPageId = paginatedResult.extensions.snapResponse.pagesIds[1];
                        const snapshotPage: any = (await snapshotRequest(secondPageId)).data;
                        await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 500);
                        const snapshotPage2: any = (await snapshotRequest(secondPageId)).data;
                        const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId))
                            .data;
                        expect(snapshotMetadata.status).toBe(SnapshotStatus.FAILED);
                    });
                },
            );
        });
    });
});
