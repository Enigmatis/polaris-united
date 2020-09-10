import { graphQLRequest } from '../server/utils/graphql-client';
import { createServers } from '../tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';

const applicationProperties = {
    id: '123123',
    name: 'polaris core tests',
};

describe('application properties tests', () => {
    test.each(createServers({ applicationProperties }))(
        'application properties was provided without version and the default version was applied',
        async server => {
            await server.start();
            const result: any = await graphQLRequest(allBooks.request);
            expect(result.allBooks).toEqual([]);
            await server.stop();
        },
    );
});
