import { graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import { polarisTest } from '../test-utils/polaris-test';

const applicationProperties = {
    id: '123123',
    name: 'polaris core tests',
};

describe('application properties tests', () => {
    test.each(createServers({ applicationProperties }))(
        'application properties was provided without version and the default version was applied',
        async (server) => {
            await polarisTest(server, async () => {
                const result: any = await graphQLRequest(allBooks.request);
                expect(result.allBooks).toEqual([]);
            });
        },
    );
});
