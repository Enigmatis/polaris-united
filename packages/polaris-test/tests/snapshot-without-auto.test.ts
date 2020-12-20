import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import {
    metadataRequest,
    snapshotRequest,
    waitUntilSnapshotRequestIsDone,
} from '../test-utils/snapshot-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooksPaginated from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import { polarisTest } from '../test-utils/polaris-test';

const config: Partial<PolarisServerOptions> = {
    maxPageSize: 5,
    snapshotConfig: {
        autoSnapshot: false,
        snapshotCleaningInterval: 1000,
        secondsToBeOutdated: 60,
        entitiesAmountPerFetch: 50,
    },
};
describe('snapshot pagination tests with auto disabled', () => {
    describe('snap request is true', () => {
        describe('snap page size', () => {
            test.each(createServers(config))(
                'snap size is 1 divides to 2 pages',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                        await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                        const paginatedResult = await graphqlRawRequest(
                            allBooksPaginated.request,
                            allBooksPaginated.headers,
                        );
                        const snapshotMetadataId =
                            paginatedResult.extensions.snapResponse.snapshotMetadataId;
                        await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                        const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId))
                            .data;
                        expect(snapshotMetadata.pagesIds.length).toBe(2);
                    });
                },
            );
            test.each(createServers(config))('snap size is 2 divides to 1 page', async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                    const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                        ...allBooksPaginated.headers,
                        'page-size': 3,
                    });
                    const snapshotMetadataId =
                        paginatedResult.extensions.snapResponse.snapshotMetadataId;
                    await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                    const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
                    expect(snapshotMetadata.pagesIds.length).toBe(1);
                });
            });
        });
        describe('data is accessible by snapshot page id', () => {
            test.each(createServers(config))('should return data for page id', async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                    const paginatedResult = await graphqlRawRequest(
                        allBooksPaginated.request,
                        allBooksPaginated.headers,
                    );
                    const snapshotMetadataId =
                        paginatedResult.extensions.snapResponse.snapshotMetadataId;
                    await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                    const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
                    const pageIds = snapshotMetadata.pagesIds;

                    const firstPage = await snapshotRequest(pageIds[0]);
                    const secondPage = await snapshotRequest(pageIds[1]);
                    const returnedBookName = [
                        firstPage.data.data.allBooksPaginated['0'].title,
                        secondPage.data.data.allBooksPaginated['0'].title,
                    ];

                    expect(returnedBookName).toContain('Book1');
                    expect(returnedBookName).toContain('Book2');
                });
            });
            test.each(createServers(config))(
                'should return extensions for page id',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                        await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                        const paginatedResult = await graphqlRawRequest(
                            allBooksPaginated.request,
                            allBooksPaginated.headers,
                        );
                        const snapshotMetadataId =
                            paginatedResult.extensions.snapResponse.snapshotMetadataId;
                        await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                        const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId))
                            .data;
                        const pageIds = snapshotMetadata.pagesIds;

                        const firstPage = await snapshotRequest(pageIds[0]);
                        const secondPage = await snapshotRequest(pageIds[1]);

                        expect(firstPage.data.extensions.totalCount).toBe(2);
                        expect(firstPage.data.extensions.dataVersion).toBe(3);
                        expect(secondPage.data.extensions.totalCount).toBe(2);
                        expect(secondPage.data.extensions.dataVersion).toBe(3);
                    });
                },
            );
        });
        test.each(createServers(config))(
            'should return empty data and regular extensions',
            async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                    const paginatedResult = await graphqlRawRequest(
                        allBooksPaginated.request,
                        allBooksPaginated.headers,
                    );
                    const snapshotMetadataId =
                        paginatedResult.extensions.snapResponse.snapshotMetadataId;
                    await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                    const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
                    expect(paginatedResult.data.allBooksPaginated).toStrictEqual([]);
                    expect(snapshotMetadata.dataVersion).toBe(3);
                    expect(snapshotMetadata.totalCount).toBe(2);
                });
            },
        );
    });
});

describe('snapshot pagination tests with default configuration', () => {
    describe('snap request is false', () => {
        test.each(createServers())('should not paginate', async (server) => {
            await polarisTest(server, async () => {
                await graphQLRequest(createBook.request, {}, { title: 'book01' });
                await graphQLRequest(createBook.request, {}, { title: 'book02' });
                const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                    ...allBooksPaginated.headers,
                    'snap-request': false,
                });
                const snapResponse = paginatedResult.extensions.snapResponse;
                expect(snapResponse).toBeUndefined();
                expect(paginatedResult.data.allBooksPaginated.length).toBe(2);
            });
        });
    });
    describe('snap request is true', () => {
        test.each(createServers())('correct extensions in response', async (server) => {
            await polarisTest(server, async () => {
                await graphQLRequest(createBook.request, {}, { title: 'book01' });
                await graphQLRequest(createBook.request, {}, { title: 'book02' });
                const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                    'snap-request': true,
                });
                const snapshotMetadataId =
                    paginatedResult.extensions.snapResponse.snapshotMetadataId;
                await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
                const pagesIds = snapshotMetadata.pagesIds;
                const firstPage = await snapshotRequest(pagesIds[0]);
                expect(pagesIds.length).toBe(1);
                expect(paginatedResult.data.allBooksPaginated).toEqual([]);
                expect(paginatedResult.extensions.prefetchBuffer).toBeUndefined();
                expect(paginatedResult.extensions.dataVersion).toBeUndefined();
                expect(paginatedResult.extensions.totalCount).toBeUndefined();
                expect(firstPage.data.extensions.snapResponse).toBeUndefined();
                expect(snapshotMetadata.currentPageIndex).toBeUndefined();
                expect(snapshotMetadata.irrelevantEntities).toBeUndefined();
                expect(snapshotMetadata.warnings).toBeUndefined();
                expect(snapshotMetadata.errors).toBeUndefined();
            });
        });
    });
});
