import {PolarisServerOptions} from '@enigmatis/polaris-core';
import {graphqlRawRequest, graphQLRequest} from '../test-utils/graphql-client';
import {metadataRequest, snapshotRequest, waitUntilSnapshotRequestIsDone,} from '../test-utils/snapshot-client';
import {createServers} from '../test-utils/tests-servers-util';
import * as allBooksPaginated from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

const config: Partial<PolarisServerOptions> = {
    snapshotConfig: {
        autoSnapshot: false,
        maxPageSize: 5,
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
                    await server.start();
                    await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                    const paginatedResult = await graphqlRawRequest(
                        allBooksPaginated.request,
                        allBooksPaginated.headers,
                    );
                    await waitUntilSnapshotRequestIsDone(
                        paginatedResult.extensions.snapResponse.snapshotMetadataId,
                        100,
                    );
                    expect(paginatedResult.extensions.snapResponse.pagesIds.length).toBe(2);
                    await server.stop();
                },
            );
            test.each(createServers(config))('snap size is 2 divides to 1 page', async (server) => {
                await server.start();
                await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                    ...allBooksPaginated.headers,
                    'snap-page-size': 3,
                });
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    100,
                );
                expect(paginatedResult.extensions.snapResponse.pagesIds.length).toBe(1);
                await server.stop();
            });
        });
        describe('data is accessible by snapshot page id', () => {
            test.each(createServers(config))('should return data for page id', async (server) => {
                await server.start();
                await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                const paginatedResult = await graphqlRawRequest(
                    allBooksPaginated.request,
                    allBooksPaginated.headers,
                );
                const pageIds = paginatedResult.extensions.snapResponse.pagesIds;
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    100,
                );
                const firstPage = await snapshotRequest(pageIds[0]);
                const secondPage = await snapshotRequest(pageIds[1]);
                const returnedBookName = [
                    firstPage.data.data.allBooksPaginated['0'].title,
                    secondPage.data.data.allBooksPaginated['0'].title,
                ];

                expect(returnedBookName).toContain('Book1');
                expect(returnedBookName).toContain('Book2');
                await server.stop();
            });
            test.each(createServers(config))(
                'should return extensions for page id',
                async (server) => {
                    await server.start();
                    await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                    const paginatedResult = await graphqlRawRequest(
                        allBooksPaginated.request,
                        allBooksPaginated.headers,
                    );
                    const pageIds = paginatedResult.extensions.snapResponse.pagesIds;
                    await waitUntilSnapshotRequestIsDone(
                        paginatedResult.extensions.snapResponse.snapshotMetadataId,
                        100,
                    );
                    const firstPage = await snapshotRequest(pageIds[0]);
                    const secondPage = await snapshotRequest(pageIds[1]);

                    expect(firstPage.data.extensions.totalCount).toBe(2);
                    expect(firstPage.data.extensions.globalDataVersion).toBe(3);
                    expect(secondPage.data.extensions.totalCount).toBe(2);
                    expect(secondPage.data.extensions.globalDataVersion).toBe(3);
                    await server.stop();
                },
            );
        });
        test.each(createServers(config))(
            'should return empty data and regular extensions',
            async (server) => {
                await server.start();
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
                expect(paginatedResult.data).toStrictEqual({});
                expect(snapshotMetadata.dataVersion).toBe(3);
                expect(snapshotMetadata.totalCount).toBe(2);
                await server.stop();
            },
        );
    });
});

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
            expect(paginatedResult.extensions.globalDataVersion).toBeUndefined();
            expect(paginatedResult.extensions.totalCount).toBeUndefined();
            expect(firstPage.data.extensions.snapResponse).toBeUndefined();
            expect(snapshotMetadata.currentPageIndex).toBeUndefined();
            expect(snapshotMetadata.irrelevantEntities).toBeUndefined();
            expect(snapshotMetadata.warnings).toBeUndefined();
            expect(snapshotMetadata.errors).toBeUndefined();
            await server.stop();
        });
    });
});
