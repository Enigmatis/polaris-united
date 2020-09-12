import { graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

describe('simple queries', () => {
    test.each(createServers())('all entities query', async (server) => {
        await server.start();
        const titles = ['book', 'book2'];
        await graphQLRequest(createBook.request, {}, { title: titles[0] });
        await graphQLRequest(createBook.request, {}, { title: titles[1] });
        const result: any = await graphQLRequest(allBooks.request);
        expect(result.allBooks[0].title).toEqual(titles[0]);
        expect(result.allBooks[1].title).toEqual(titles[1]);
        await server.stop();
    });
    test.each(createServers())('query with arguments', async (server) => {
        await server.start();
        const title = 'book';
        await graphQLRequest(createBook.request, {}, { title });
        const result: any = await graphQLRequest(booksByTitle.request, {}, { title });
        expect(result.bookByTitle[0].title).toEqual(title);
        await server.stop();
    });
});
