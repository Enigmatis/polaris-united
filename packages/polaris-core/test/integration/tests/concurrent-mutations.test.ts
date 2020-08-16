import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';

let polarisServer: PolarisServer;
const req1Vars = { firstName: 'or', lastName: 'cohen' };
const req2Vars = { firstName: 'bar', lastName: 'shamir' };
const req3Vars = { firstName: 'ben', lastName: 'ten' };
beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(async () => {
    await stopTestServer(polarisServer);
});

describe('concurrent mutations tests', () => {
    it('executes multiple concurrent mutations, the mutations executed successfully', async done => {
        let firstDone = false;
        let secondDone = false;
        let thirdDone = false;

        graphQLRequest(createAuthor.request, {}, req1Vars)
            .then()
            .then((res: any) => {
                expect(res.createAuthor).toBeDefined();
                expect(res.createAuthor.firstName).toBe(req1Vars.firstName);
                expect(res.createAuthor.lastName).toBe(req1Vars.lastName);
                firstDone = true;

                if (secondDone && thirdDone) {
                    graphqlRawRequest(allBooks.request, undefined).then(value => {
                        expect(value.extensions.globalDataVersion).toBe(1 + 3);
                        done();
                    });
                }
            });
        graphQLRequest(createAuthor.request, {}, req2Vars).then((res: any) => {
            expect(res.createAuthor).toBeDefined();
            expect(res.createAuthor.firstName).toBe(req2Vars.firstName);
            expect(res.createAuthor.lastName).toBe(req2Vars.lastName);
            secondDone = true;

            if (firstDone && thirdDone) {
                graphqlRawRequest(allBooks.request, undefined).then(value => {
                    expect(value.extensions.globalDataVersion).toBe(1 + 3);
                    done();
                });
            }
        });
        graphQLRequest(createAuthor.request, {}, req3Vars).then((res: any) => {
            expect(res.createAuthor).toBeDefined();
            expect(res.createAuthor.firstName).toBe(req3Vars.firstName);
            expect(res.createAuthor.lastName).toBe(req3Vars.lastName);
            thirdDone = true;

            if (firstDone && secondDone) {
                graphqlRawRequest(allBooks.request, undefined).then(value => {
                    expect(value.extensions.globalDataVersion).toBe(1 + 3);
                    done();
                });
            }
        });
    });
});
