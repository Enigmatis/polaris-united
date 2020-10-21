import {allBooksNoConnectionData} from '../server-without-connection/schema/resolvers';
import {graphQLRequest} from '../test-utils/graphql-client';
import {createServersWithoutConnection} from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooksNoConnection.json';

describe('directives tests', () => {
    test.each(createServersWithoutConnection())(
        'query a field with directive, directive logic activated',
        async (server) => {
            await server.start();
            const result: any = await graphQLRequest(allBooks.request);
            expect(result.allBooks[0].coverColor).toEqual(
                allBooksNoConnectionData[0].coverColor.toUpperCase(),
            );
            expect(result.allBooks[1].coverColor).toEqual(
                allBooksNoConnectionData[1].coverColor.toUpperCase(),
            );
            expect(result.allBooks[2].coverColor).toEqual(
                allBooksNoConnectionData[2].coverColor.toUpperCase(),
            );
            await server.stop();
        },
    );
});
