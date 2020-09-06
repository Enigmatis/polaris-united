import { PolarisServerOptions } from '../../../src';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import { snapshotRequest, waitUntilSnapshotRequestIsDone } from '../server/utils/snapshot-client';
import { createServers } from '../tests-servers-util';
import * as paginatedQuery from './jsonRequestsAndHeaders/allBooksPaginated.json';
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
            test.each(createServers(config))('snap size is 1 divides to 2 pages', async server => {
                await server.start();
                await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                const paginatedResult = await graphqlRawRequest(
                    paginatedQuery.request,
                    paginatedQuery.headers,
                );
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    100,
                );
                expect(paginatedResult.extensions.snapResponse.pagesIds.length).toBe(2);
                await server.stop();
            });
            test.each(createServers(config))('snap size is 2 divides to 1 page', async server => {
                await server.start();
                await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                    ...paginatedQuery.headers,
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
            test.each(createServers(config))('should return data for page id', async server => {
                await server.start();
                await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                const paginatedResult = await graphqlRawRequest(
                    paginatedQuery.request,
                    paginatedQuery.headers,
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
                async server => {
                    await server.start();
                    await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                    await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                    const paginatedResult = await graphqlRawRequest(
                        paginatedQuery.request,
                        paginatedQuery.headers,
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
            async server => {
                await server.start();

                await graphQLRequest(createBook.request, {}, { title: 'Book1' });
                await graphQLRequest(createBook.request, {}, { title: 'Book2' });

                const paginatedResult = await graphqlRawRequest(
                    paginatedQuery.request,
                    paginatedQuery.headers,
                );
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    100,
                );
                expect(paginatedResult.data).toStrictEqual({});
                expect(paginatedResult.extensions.globalDataVersion).toBe(3);
                expect(paginatedResult.extensions.totalCount).toBe(2);
                await server.stop();
            },
        );
    });
});
