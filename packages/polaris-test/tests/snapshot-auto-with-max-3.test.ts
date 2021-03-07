import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { metadataRequest, waitUntilSnapshotRequestIsDone } from '../test-utils/snapshot-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooksPaginated from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import { polarisTest } from '../test-utils/polaris-test';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
const config: Partial<PolarisServerOptions> = {
    maxPageSize: 3,
    snapshotConfig: {
        autoSnapshot: true,
        snapshotCleaningInterval: 1000,
        secondsToBeOutdated: 60,
        entitiesAmountPerFetch: 50,
    },
};

describe('snapshot pagination tests with auto enabled', () => {
    describe('max page size is 3', () => {
        describe('snap request is true', () => {
            test.each(createServers(config))(
                'should not paginate if total count is smaller than minimal page size',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: 'book01' });
                        await graphQLRequest(createBook.request, {}, { title: 'book02' });
                        const paginatedResult: any = await graphqlRawRequest(
                            allBooksPaginated.request,
                            {
                                ...allBooksPaginated.headers,
                                'page-size': 10,
                            },
                        );
                        const snapResponse = paginatedResult.extensions.snapResponse;
                        expect(snapResponse).toBeUndefined();
                        expect(paginatedResult.data.allBooksPaginated.length).toBe(2);
                    });
                },
            );
        });
        describe('snap request is false', () => {
            test.each(createServers(config))(
                'should paginate if total count is larger than minimal page size',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: 'book01' });
                        await graphQLRequest(createBook.request, {}, { title: 'book02' });
                        const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                            ...allBooksPaginated.headers,
                            'snap-request': false,
                            'page-size': 1,
                        });
                        const snapshotMetadataId =
                            paginatedResult.extensions.snapResponse.snapshotMetadataId;
                        await waitUntilSnapshotRequestIsDone(snapshotMetadataId, 1000);
                        const snapshotMetadata = (await metadataRequest(snapshotMetadataId)).data;
                        expect(snapshotMetadata.pagesIds.length).toBe(2);
                    });
                },
            );
            test.each(createServers(config))(
                'should not paginate if total count is smaller than minimal page size',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: 'book01' });
                        await graphQLRequest(createBook.request, {}, { title: 'book02' });
                        const paginatedResult: any = await graphqlRawRequest(
                            allBooksPaginated.request,
                            {
                                ...allBooksPaginated.headers,
                                'snap-request': false,
                                'page-size': 10,
                            },
                        );
                        const snapResponse = paginatedResult.extensions.snapResponse;
                        expect(snapResponse).toBeUndefined();
                        expect(paginatedResult.data.allBooksPaginated.length).toBe(2);
                    });
                },
            );
            test.each(createServers(config))(
                'execute all books request, auto snapshot config is true, there is no transactions active',
                async (server) => {
                    await polarisTest(server, async () => {
                        await graphQLRequest(createBook.request, {}, { title: 'book01' });
                        await graphQLRequest(createBook.request, {}, { title: 'book02' });
                        await graphqlRawRequest(allBooks.request);
                        const res = await graphqlRawRequest(
                            'query { isThereTransactionActive }',
                            {},
                            {},
                        );
                        expect(res.data.isThereTransactionActive).toEqual(false);
                    });
                },
            );
        });
    });
});
