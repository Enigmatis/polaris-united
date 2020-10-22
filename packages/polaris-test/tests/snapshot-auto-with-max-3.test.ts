import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { waitUntilSnapshotRequestIsDone } from '../test-utils/snapshot-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooksPaginated from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import { polarisTest } from '../test-utils/polaris-test';

const config: Partial<PolarisServerOptions> = {
    snapshotConfig: {
        autoSnapshot: true,
        maxPageSize: 3,
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
                                'snap-page-size': 10,
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
                            'snap-page-size': 1,
                        });
                        const pageIds = paginatedResult.extensions.snapResponse.pagesIds;
                        await waitUntilSnapshotRequestIsDone(
                            paginatedResult.extensions.snapResponse.snapshotMetadataId,
                            1000,
                        );
                        expect(pageIds.length).toBe(2);
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
                                'snap-page-size': 10,
                            },
                        );
                        const snapResponse = paginatedResult.extensions.snapResponse;
                        expect(snapResponse).toBeUndefined();
                        expect(paginatedResult.data.allBooksPaginated.length).toBe(2);
                    });
                },
            );
        });
    });
});
