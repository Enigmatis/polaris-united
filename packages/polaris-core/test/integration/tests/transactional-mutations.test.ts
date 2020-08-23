import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as authorsByFirstName from './jsonRequestsAndHeaders/authorsByFirstName.json';
import * as multipleMutationsWithBrokenOne from './jsonRequestsAndHeaders/multipleMutationsWithBrokenOne.json';
let polarisServer: PolarisServer;
const variables = {
    firstName: 'itay',
    lastName: 'kl',
    fName: 'asd',
    lName: 'asd',
};
describe('transactional mutations enabled integration tests', () => {
    beforeEach(async () => {
        polarisServer = await startTestServer();
    });

    afterEach(async () => {
        await stopTestServer(polarisServer);
    });

    it("execute multiple mutations in one request and one of the mutations is broken, the data version wasn't changed", async () => {
        let dataVersionBeforeUpdate;
        try {
            dataVersionBeforeUpdate = (await graphqlRawRequest(allBooks.request)).extensions
                .globalDataVersion;
            await graphQLRequest(multipleMutationsWithBrokenOne.request, {}, variables);
        } catch (err) {
            const dataVersionAfterUpdate = (await graphqlRawRequest(allBooks.request)).extensions
                .globalDataVersion;
            expect(dataVersionAfterUpdate).toEqual(dataVersionBeforeUpdate);
        }
    });

    it("execute multiple mutations in one request and one of the mutations is broken, the data in db wasn't changed", async () => {
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
});
