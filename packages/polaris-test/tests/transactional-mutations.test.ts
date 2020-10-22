import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as authorsByFirstName from './jsonRequestsAndHeaders/authorsByFirstName.json';
import * as multipleMutationsWithBrokenOne from './jsonRequestsAndHeaders/multipleMutationsWithBrokenOne.json';
import { polarisTest } from '../test-utils/polaris-test';
const variables = { firstName: 'itay', lastName: 'kl', fName: 'asd', lName: 'asd' };
describe('transactional mutations enabled integration tests', () => {
    test.each(createServers())(
        "execute multiple mutations in one request and one of the mutations is broken, the data version wasn't changed",
        async (server) => {
            await polarisTest(server, async () => {
                expect.assertions(1);
                let dataVersionBeforeUpdate;
                try {
                    dataVersionBeforeUpdate = (await graphqlRawRequest(allBooks.request)).extensions
                        .globalDataVersion;
                    await graphQLRequest(multipleMutationsWithBrokenOne.request, {}, variables);
                } catch (err) {
                    const dataVersionAfterUpdate = (await graphqlRawRequest(allBooks.request))
                        .extensions.globalDataVersion;
                    expect(dataVersionAfterUpdate).toEqual(dataVersionBeforeUpdate);
                }
            });
        },
    );
    test.each(createServers())(
        "execute multiple mutations in one request and one of the mutations is broken, the data in db wasn't changed",
        async (server) => {
            await polarisTest(server, async () => {
                expect.assertions(2);
                try {
                    await graphQLRequest(multipleMutationsWithBrokenOne.request, {}, variables);
                } catch (err) {
                    const result: any = await graphQLRequest(
                        authorsByFirstName.requestTwo,
                        {},
                        {
                            name: variables.firstName,
                            name2: variables.fName,
                        },
                    );
                    expect(result.a.length).toEqual(0);
                    expect(result.b.length).toEqual(0);
                }
            });
        },
    );
});
