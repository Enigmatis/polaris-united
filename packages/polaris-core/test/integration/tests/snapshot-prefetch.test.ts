import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import { snapshotRequest, waitUntilSnapshotRequestIsDone } from '../server/utils/snapshot-client';
import * as paginatedQuery from './jsonRequestsAndHeaders/allBooksPaginated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

let polarisServer: PolarisServer;

afterEach(async () => {
    await stopTestServer(polarisServer);
});
const titles = ['Book1', 'Book2'];
describe('snapshot pagination tests with auto disabled', () => {
    describe('snap request is true', () => {
        describe('prefetch is 1', () => {
            beforeEach(async () => {
                polarisServer = await startTestServer({
                    snapshotConfig: {
                        autoSnapshot: false,
                        maxPageSize: 5,
                        snapshotCleaningInterval: 1000,
                        secondsToBeOutdated: 60,
                        entitiesAmountPerFetch: 1,
                    },
                });
                await graphQLRequest(createBook.request, {}, { title: titles[0] });
                await graphQLRequest(createBook.request, {}, { title: titles[1] });
            });
            it('should query the db every time', async () => {
                const paginatedResult = await graphqlRawRequest(
                    paginatedQuery.request,
                    paginatedQuery.headers,
                );
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    100,
                );
                const firstPage = await snapshotRequest(
                    paginatedResult.extensions.snapResponse.pagesIds[0],
                );
                const secondPage = await snapshotRequest(
                    paginatedResult.extensions.snapResponse.pagesIds[1],
                );
                const returnedBookName = [
                    firstPage.data.data.allBooksPaginated[0].title,
                    secondPage.data.data.allBooksPaginated[0].title,
                ];

                expect(paginatedResult.extensions.snapResponse.pagesIds.length).toBe(2);
                expect(returnedBookName).toContain(titles[0]);
                expect(returnedBookName).toContain(titles[1]);
            });
        });
        describe('prefetch is 2', () => {
            beforeEach(async () => {
                polarisServer = await startTestServer({
                    snapshotConfig: {
                        autoSnapshot: false,
                        maxPageSize: 5,
                        snapshotCleaningInterval: 1000,
                        secondsToBeOutdated: 60,
                        entitiesAmountPerFetch: 2,
                    },
                });

                await graphQLRequest(createBook.request, {}, { title: titles[0] });
                await graphQLRequest(createBook.request, {}, { title: titles[1] });
            });
            it('should query the db once snap page size is 1', async () => {
                const paginatedResult = await graphqlRawRequest(
                    paginatedQuery.request,
                    paginatedQuery.headers,
                );
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    100,
                );
                const firstPage = await snapshotRequest(
                    paginatedResult.extensions.snapResponse.pagesIds[0],
                );
                const secondPage = await snapshotRequest(
                    paginatedResult.extensions.snapResponse.pagesIds[1],
                );
                const returnedBookName = [
                    firstPage.data.data.allBooksPaginated[0].title,
                    secondPage.data.data.allBooksPaginated[0].title,
                ];

                expect(paginatedResult.extensions.snapResponse.pagesIds.length).toBe(2);
                expect(returnedBookName).toContain(titles[0]);
                expect(returnedBookName).toContain(titles[1]);
            });

            it('snap page size is 2 query the db once', async () => {
                const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                    ...paginatedQuery.headers,
                    'snap-page-size': 2,
                });
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    100,
                );
                const firstPage = await snapshotRequest(
                    paginatedResult.extensions.snapResponse.pagesIds[0],
                );
                const returnedBookName = [
                    firstPage.data.data.allBooksPaginated[0].title,
                    firstPage.data.data.allBooksPaginated[1].title,
                ];

                expect(paginatedResult.extensions.snapResponse.pagesIds.length).toBe(1);
                expect(returnedBookName).toContain(titles[0]);
                expect(returnedBookName).toContain(titles[1]);
            });
        });
        describe('prefetch is larger than response size', () => {
            beforeEach(async () => {
                polarisServer = await startTestServer({
                    snapshotConfig: {
                        autoSnapshot: false,
                        maxPageSize: 5,
                        snapshotCleaningInterval: 1000,
                        secondsToBeOutdated: 60,
                        entitiesAmountPerFetch: 50,
                    },
                });
                await graphQLRequest(createBook.request, {}, { title: titles[0] });
                await graphQLRequest(createBook.request, {}, { title: titles[1] });
            });
            it('snap page size is 1', async () => {
                const paginatedResult = await graphqlRawRequest(
                    paginatedQuery.request,
                    paginatedQuery.headers,
                );
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    100,
                );
                const firstPage = await snapshotRequest(
                    paginatedResult.extensions.snapResponse.pagesIds[0],
                );
                const secondPage = await snapshotRequest(
                    paginatedResult.extensions.snapResponse.pagesIds[1],
                );
                const returnedBookName = [
                    firstPage.data.data.allBooksPaginated[0].title,
                    secondPage.data.data.allBooksPaginated[0].title,
                ];

                expect(paginatedResult.extensions.snapResponse.pagesIds.length).toBe(2);
                expect(returnedBookName).toContain(titles[0]);
                expect(returnedBookName).toContain(titles[1]);
            });

            it('snap page size is 2', async () => {
                const paginatedResult = await graphqlRawRequest(paginatedQuery.request, {
                    ...paginatedQuery.headers,
                    'snap-page-size': 2,
                });
                await waitUntilSnapshotRequestIsDone(
                    paginatedResult.extensions.snapResponse.snapshotMetadataId,
                    100,
                );
                const firstPage = await snapshotRequest(
                    paginatedResult.extensions.snapResponse.pagesIds[0],
                );
                const returnedBookName = [
                    firstPage.data.data.allBooksPaginated[0].title,
                    firstPage.data.data.allBooksPaginated[1].title,
                ];

                expect(paginatedResult.extensions.snapResponse.pagesIds.length).toBe(1);
                expect(returnedBookName).toContain(titles[0]);
                expect(returnedBookName).toContain(titles[1]);
            });
        });
    });
});
