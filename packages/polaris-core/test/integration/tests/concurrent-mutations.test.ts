import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import { createServers } from '../tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';

const mutationReq = async (
    variables: any,
    statuses: boolean[],
    index: number,
): Promise<boolean> => {
    const res: any = await graphQLRequest(createAuthor.request, {}, variables);
    expect(res.createAuthor).toBeDefined();
    expect(res.createAuthor.firstName).toBe(variables.firstName);
    expect(res.createAuthor.lastName).toBe(variables.lastName);
    statuses[index] = true;
    if (statuses.filter(x => !x).length === 0) {
        const value = await graphqlRawRequest(allBooks.request);
        expect(value.extensions.globalDataVersion).toBe(4);
        return true;
    }
    return false;
};

describe('concurrent mutations tests', () => {
    test.each(createServers())(
        'executes multiple concurrent mutations, the mutations executed successfully',
        async server => {
            await server.start();
            const statuses = [false, false, false];
            const req = mutationReq({ firstName: 'or', lastName: 'cohen' }, statuses, 0);
            const req1 = mutationReq({ firstName: 'bar', lastName: 'shamir' }, statuses, 1);
            const req2 = mutationReq({ firstName: 'ben', lastName: 'ten' }, statuses, 2);
            expect((await req) || (await req1) || (await req2)).toBeTruthy();
            await server.stop();
        },
    );
});
