import { allBooksNoConnectionData } from '../server-without-connection/schema/resolvers';
import { graphQLRequest } from '../server/utils/graphql-client';
import { createServersWithoutConnection } from '../tests-servers-util';
import * as allBooksNoConnection from './jsonRequestsAndHeaders/allBooksNoConnection.json';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';

describe('simple queries without connection', () => {
    test.each(createServersWithoutConnection())('all entities query', async server => {
        await server.start();
        const result: any = await graphQLRequest(allBooksNoConnection.request);
        expect(result.allBooks[0].title).toEqual(allBooksNoConnectionData[0].title);
        expect(result.allBooks[1].title).toEqual(allBooksNoConnectionData[1].title);
        await server.stop();
    });
    test.each(createServersWithoutConnection())('query with arguments', async server => {
        await server.start();
        const title = allBooksNoConnectionData[2].title;
        const result: any = await graphQLRequest(booksByTitle.request, {}, { title });
        expect(result.bookByTitle[0].title).toEqual(title);
        await server.stop();
    });
});
