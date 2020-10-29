import { createServers } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';
import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as onlineBooksPagination from './jsonRequestsAndHeaders/onlineBooksPagination.json';
const bookIds: any[] = [];
const setUp = async () => {
    for (let i = 1; i <= 10; i++) {
        const res = await graphQLRequest(createBook.request, {}, { title: `book${i}` });
        bookIds.push(res.createBook.id);
    }
};

const tearDown = () => bookIds.slice(0, bookIds.length - 1);

describe('online pagination tests', () => {
    describe('first & after test cases', () => {
        test.each(createServers())(
            'ffsdgggggggggggggggggggggggggggggggggggggggggg',
            async (server) => {
                await polarisTest(server, async () => {
                    await setUp();
                    const query1 = await graphqlRawRequest(
                        onlineBooksPagination.request,
                        {},
                        { pagingArgs: { first: 6 } },
                    );
                    const s = 5;
                    // expect(snapshotMetadata.id).toBe(snapshotMetadataId);
                    // expect(snapshotMetadata.pagesCount).toBe(2);
                    // expect(snapshotMetadata.status).toBe(SnapshotStatus.DONE);
                    tearDown();
                });
            },
        );
    });
});
