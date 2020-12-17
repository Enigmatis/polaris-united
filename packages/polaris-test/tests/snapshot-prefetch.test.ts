import { PolarisServerOptions } from '@enigmatis/polaris-core';
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

let config: Partial<PolarisServerOptions> = {
    maxPageSize: 5,
    snapshotConfig: {
        autoSnapshot: false,
        snapshotCleaningInterval: 1000,
        secondsToBeOutdated: 60,
        entitiesAmountPerFetch: 1,
    },
};

const titles = ['Book1', 'Book2'];
describe('snapshot pagination tests with auto disabled', () => {
    describe('snap request is true', () => {
        describe('prefetch is 1', () => {
            test.each(createServers(config))('should query the db every time', async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: titles[0] });
                    await graphQLRequest(createBook.request, {}, { title: titles[1] });
                    const paginatedResult = await graphqlRawRequest(
                        paginatedQuery.request,
                        paginatedQuery.headers,
                    );
                    const snapshotMetadataId =
                        paginatedResult.extensions.snapResponse.snapshotMetadataId;
                    await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                    const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
                    const pagesIds = snapshotMetadata.pagesIds;

                    const firstPage: any = (await snapshotRequest(pagesIds[0])).data.data
                        .allBooksPaginated;
                    const secondPage: any = (await snapshotRequest(pagesIds[1])).data.data
                        .allBooksPaginated;
                    const returnedBookName = [firstPage[0].title, secondPage[0].title];
                    expect(snapshotMetadata.pagesIds.length).toBe(2);
                    expect(returnedBookName).toContain(titles[0]);
                    expect(returnedBookName).toContain(titles[1]);
                });
            });
        });
        describe('prefetch is 2', () => {
            config = {
                maxPageSize: 5,
                snapshotConfig: {
                    autoSnapshot: false,
                    snapshotCleaningInterval: 1000,
                    secondsToBeOutdated: 60,
                    entitiesAmountPerFetch: 2,
                },
            };
            test.each(createServers(config))(
                'should query the db once snap page size is 1',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: titles[0] });
                        await graphQLRequest(createBook.request, {}, { title: titles[1] });

                        const paginatedResult = await graphqlRawRequest(
                            paginatedQuery.request,
                            paginatedQuery.headers,
                        );
                        const snapshotMetadataId =
                            paginatedResult.extensions.snapResponse.snapshotMetadataId;
                        await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                        const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId))
                            .data;
                        const pagesIds = snapshotMetadata.pagesIds;

                        const firstPage = await snapshotRequest(pagesIds[0]);
                        const secondPage = await snapshotRequest(pagesIds[1]);
                        const returnedBookName = [
                            firstPage.data.data.allBooksPaginated[0].title,
                            secondPage.data.data.allBooksPaginated[0].title,
                        ];
                        expect(snapshotMetadata.pagesIds.length).toBe(2);
                        expect(returnedBookName).toContain(titles[0]);
                        expect(returnedBookName).toContain(titles[1]);
                    });
                },
            );
            test.each(createServers(config))(
                'snap page size is 2 query the db once',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: titles[0] });
                        await graphQLRequest(createBook.request, {}, { title: titles[1] });

                        const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                            ...paginatedQuery.headers,
                            'page-size': 2,
                        });
                        const snapshotMetadataId =
                            paginatedResult.extensions.snapResponse.snapshotMetadataId;
                        await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                        const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId))
                            .data;
                        const pagesIds = snapshotMetadata.pagesIds;
                        const firstPage = await snapshotRequest(pagesIds[0]);
                        const returnedBookName = [
                            firstPage.data.data.allBooksPaginated[0].title,
                            firstPage.data.data.allBooksPaginated[1].title,
                        ];
                        expect(snapshotMetadata.pagesIds.length).toBe(1);
                        expect(returnedBookName).toContain(titles[0]);
                        expect(returnedBookName).toContain(titles[1]);
                    });
                },
            );
        });
        describe('prefetch is larger than response size', () => {
            config = {
                maxPageSize: 5,
                snapshotConfig: {
                    autoSnapshot: false,
                    snapshotCleaningInterval: 1000,
                    secondsToBeOutdated: 60,
                    entitiesAmountPerFetch: 50,
                },
            };
            test.each(createServers(config))('snap page size is 1', async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: titles[0] });
                    await graphQLRequest(createBook.request, {}, { title: titles[1] });

                    const paginatedResult = await graphqlRawRequest(
                        paginatedQuery.request,
                        paginatedQuery.headers,
                    );
                    const snapshotMetadataId =
                        paginatedResult.extensions.snapResponse.snapshotMetadataId;
                    await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                    const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
                    const pagesIds = snapshotMetadata.pagesIds;
                    const firstPage = await snapshotRequest(pagesIds[0]);
                    const secondPage = await snapshotRequest(pagesIds[1]);
                    const returnedBookName = [
                        firstPage.data.data.allBooksPaginated[0].title,
                        secondPage.data.data.allBooksPaginated[0].title,
                    ];

                    expect(pagesIds.length).toBe(2);
                    expect(returnedBookName).toContain(titles[0]);
                    expect(returnedBookName).toContain(titles[1]);
                });
            });
            test.each(createServers(config))('snap page size is 2', async (server) => {
                await polarisTest(server, async () => {
                    await graphQLRequest(createBook.request, {}, { title: titles[0] });
                    await graphQLRequest(createBook.request, {}, { title: titles[1] });

                    const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                        ...paginatedQuery.headers,
                        'page-size': 2,
                    });
                    const snapshotMetadataId =
                        paginatedResult.extensions.snapResponse.snapshotMetadataId;
                    await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 100);
                    const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId)).data;
                    const pagesIds = snapshotMetadata.pagesIds;
                    const firstPage = await snapshotRequest(pagesIds[0]);
                    const returnedBookName = [
                        firstPage.data.data.allBooksPaginated[0].title,
                        firstPage.data.data.allBooksPaginated[1].title,
                    ];

                    expect(pagesIds.length).toBe(1);
                    expect(returnedBookName).toContain(titles[0]);
                    expect(returnedBookName).toContain(titles[1]);
                });
            });
        });
    });
});
