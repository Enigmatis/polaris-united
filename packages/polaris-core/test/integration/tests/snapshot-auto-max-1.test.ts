import { PolarisServerOptions } from '../../../src';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import { waitUntilSnapshotRequestIsDone } from '../server/utils/snapshot-client';
import { createServers } from '../tests-servers-util';
import * as allBooksPaginated from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

const config: Partial<PolarisServerOptions> = {
    snapshotConfig: {
        autoSnapshot: true,
        maxPageSize: 1,
        snapshotCleaningInterval: 1000,
        secondsToBeOutdated: 60,
        entitiesAmountPerFetch: 50,
    },
};

describe('snapshot pagination tests with auto enabled', () => {
    describe('max page size is 1', () => {
        describe('snap request is false', () => {
            test.each(createServers(config))('should paginated anyway', async server => {
                await server.start();
                await graphQLRequest(createBook.request, {}, { title: 'book01' });
                await graphQLRequest(createBook.request, {}, { title: 'book02' });
                const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                    ...allBooksPaginated.headers,
                    'snap-request': false,
                });
                const pageIds = paginatedResult.extensions.snapResponse.pagesIds;
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    1000,
                );
                expect(pageIds.length).toBe(2);
                await server.stop();
            });
            test.each(createServers(config))(
                'should paginated according to minimal snap page size provided',
                async server => {
                    await server.start();
                    await graphQLRequest(createBook.request, {}, { title: 'book01' });
                    await graphQLRequest(createBook.request, {}, { title: 'book02' });
                    const paginatedResult = await graphqlRawRequest(allBooksPaginated.request, {
                        ...allBooksPaginated.headers,
                        'snap-request': false,
                        'snap-page-size': 10,
                    });
                    const pageIds = paginatedResult.extensions.snapResponse.pagesIds;
                    await waitUntilSnapshotRequestIsDone(
                        paginatedResult.extensions.snapResponse.snapshotMetadataId,
                        1000,
                    );
                    expect(pageIds.length).toBe(2);
                    await server.stop();
                },
            );
        });
    });
});
