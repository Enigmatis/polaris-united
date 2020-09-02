import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(() => {
    return stopTestServer(polarisServer);
});

describe('simple queries', () => {
    it('all entities query', async () => {
        const titles = ['book', 'book2'];
        await graphQLRequest(createBook.request, {}, { title: titles[0] });
        await graphQLRequest(createBook.request, {}, { title: titles[1] });
        const result: any = await graphQLRequest(allBooks.request);
        expect(result.allBooks[0].title).toEqual(titles[0]);
        expect(result.allBooks[1].title).toEqual(titles[1]);
    });

    it('query with arguments', async () => {
        const title = 'book';
        await graphQLRequest(createBook.request, {}, { title });
        const result: any = await graphQLRequest(booksByTitle.request, {}, { title });
        expect(result.bookByTitle[0].title).toEqual(title);
    });
});
