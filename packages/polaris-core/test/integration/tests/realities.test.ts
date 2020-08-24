import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(() => {
    return stopTestServer(polarisServer);
});
const author = {
    firstName: 'Amos',
    lastName: 'Oz',
};
const realityId = 3;
const defaultRealityId = 0;
const realityHeader = { 'reality-id': 3 };
const includeOperAndRealityHeader = { 'include-linked-oper': true, 'reality-id': realityId };
const title = 'book';
describe('reality is specified in the headers', () => {
    it('should set reality of the entity from the header', async () => {
        const result: any = await graphQLRequest(createAuthor.request, realityHeader, author);
        expect(result.createAuthor.realityId).toEqual(realityId);
    });

    it('should filter entities for the specific reality', async () => {
        await graphQLRequest(createBook.request, realityHeader, { title });
        const result: any = await graphQLRequest(allBooks.request, realityHeader);
        result.allBooks.forEach((book: { realityId: number }) => {
            expect(book.realityId).toEqual(realityId);
        });
    });

    describe('include linked operational entities', () => {
        it('should link operational entities if set to true', async () => {
            const authorId = ((await graphQLRequest(
                createAuthor.request,
                {},
                createAuthor.variables,
            )) as any).createAuthor.id;
            await graphQLRequest(createBook.request, includeOperAndRealityHeader, {
                title,
                authorId,
            });
            const result: any = await graphQLRequest(allBooks.request, includeOperAndRealityHeader);
            result.allBooks.forEach(
                (book: { realityId: number; author: { realityId: number } }) => {
                    expect(book.realityId).toBe(realityId);
                    expect(book.author.realityId).toBe(defaultRealityId);
                },
            );
        });

        it('should filter operational entities if set to false', async () => {
            const authorId = ((await graphQLRequest(
                createAuthor.request,
                {},
                createAuthor.variables,
            )) as any).createAuthor.id;
            await graphQLRequest(createBook.request, includeOperAndRealityHeader, {
                title,
                authorId,
            });

            const result: any = await graphQLRequest(allBooks.request, realityHeader);

            result.allBooks.forEach((book: { author: any }) => {
                expect(book.author).toBeNull();
            });
        });
    });
});
