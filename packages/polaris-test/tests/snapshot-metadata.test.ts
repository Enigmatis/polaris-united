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
import * as deleteBook from './jsonRequestsAndHeaders/deleteBook.json';
import { v4 as uuid } from 'uuid';

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
                    const snapshotMetadataAfter: any = (await metadataRequest(snapshotMetadataId))
                        .data;
                    expect(snapshotMetadata.status).toBe(SnapshotStatus.IN_PROGRESS);
                    expect(snapshotMetadata.dataVersion).toBe(3);
                    expect(snapshotMetadataAfter.status).toBe(SnapshotStatus.DONE);
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
                    const snapshotPageAfterFinished: any = (await snapshotRequest(secondPageId))
                        .data;
                    expect(snapshotPage.status).toBe(SnapshotStatus.IN_PROGRESS);
                    expect(snapshotPageAfterFinished.data).toBeDefined();
                });
            },
        );

        describe('snapshot page & metadata id does not exist', () => {
            test.each(createServers(config))('correct return message', async (server) => {
                await polarisTest(server, async () => {
                    const id = uuid();
                    const snapshotPageNotExist: any = (await snapshotRequest(id)).data;
                    const snapshotMetadataNotExist: any = (await metadataRequest(id)).data;
                    expect(snapshotPageNotExist.message).toEqual(
                        `Snapshot page with id ${id} not found`,
                    );
                    expect(snapshotMetadataNotExist.message).toEqual(
                        `Snapshot metadata with id ${id} not found`,
                    );
                });
            });
        });

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
                        const firstPageId = paginatedResult.extensions.snapResponse.pagesIds[0];
                        await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 500);
                        const snapshotPage1: any = (await snapshotRequest(firstPageId)).data;
                        const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId))
                            .data;
                        expect(snapshotPage1.status).toBe(SnapshotStatus.FAILED);
                        expect(snapshotMetadata.status).toBe(SnapshotStatus.FAILED);
                        expect(snapshotMetadata.warnings).toBe('warning 1,warning 2');
                        expect(snapshotMetadata.errors).toBe('Error: all books paginated error');
                    });
                },
            );
        });
        describe('irrelevant entities in metadata response', () => {
            test.each(createServers(config))(
                'delete book, get id in irrelevant entities in metadata endpoint',
                async (server) => {
                    await polarisTest(server, async () => {
                        const res: any = await graphQLRequest(
                            createBook.request,
                            {},
                            { title: 'book' },
                        );
                        await graphQLRequest(createBook.request, {}, { title: 'book2' });
                        await graphQLRequest(createBook.request, {}, { title: 'book3' });
                        await graphQLRequest(deleteBook.request, {}, { id: res.createBook.id });
                        const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                            ...paginatedQuery.headers,
                            'data-version': 2,
                        });
                        const { snapshotMetadataId } = paginatedResult.extensions.snapResponse;
                        await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 500);
                        const snapshotMetadata: any = (await metadataRequest(snapshotMetadataId))
                            .data;
                        expect(snapshotMetadata.irrelevantEntities.allBooksPaginated[0]).toEqual(
                            res.createBook.id,
                        );
                    });
                },
            );
        });
    });
});
