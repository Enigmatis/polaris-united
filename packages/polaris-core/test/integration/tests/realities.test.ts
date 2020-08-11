import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as includeLinkedOperEnabled from './jsonRequestsAndHeaders/includeLinkedOperEnabled.json';
import * as mutation from './jsonRequestsAndHeaders/mutation.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(() => {
    return stopTestServer(polarisServer);
});

describe('reality is specified in the headers', () => {
    it('should set reality of the entity from the header', async () => {
        const result: any = await graphQLRequest(
            mutation.request,
            { 'reality-id': 3 },
            {
                firstName: 'Amos',
                lastName: 'Oz',
            },
        );

        expect(result.createAuthor.realityId).toEqual(3);
    });

    it('should filter entities for the specific reality', async () => {
        const reality = { 'reality-id': 3 };
        await graphqlRawRequest(createBook.request, reality, {
            title: 'book01',
        });
        const result: any = await graphQLRequest(allBooks.request, reality);
        result.allBooks.forEach((book: { realityId: number }) => {
            expect(book.realityId).toEqual(3);
        });
    });

    describe('include linked operational entities', () => {
        it('should link operational entities if set to true', async () => {
            const authorId = ((await graphQLRequest(
                createAuthor.request,
                undefined,
                createAuthor.variables,
            )) as any).createAuthor.id;
            await graphqlRawRequest(createBook.request, includeLinkedOperEnabled.headers, {
                title: 'book01',
                authorId,
            });
            const result: any = await graphQLRequest(
                includeLinkedOperEnabled.request,
                includeLinkedOperEnabled.headers,
            );
            result.allBooks.forEach(
                (book: { realityId: number; author: { realityId: number } }) => {
                    expect(book.realityId).toBe(3);
                    expect(book.author.realityId).toBe(0);
                },
            );
        });

        it('should filter operational entities if set to false', async () => {
            const authorId = ((await graphQLRequest(
                createAuthor.request,
                undefined,
                createAuthor.variables,
            )) as any).createAuthor.id;
            await graphqlRawRequest(createBook.request, includeLinkedOperEnabled.headers, {
                title: 'book01',
                authorId,
            });

            const result: any = await graphQLRequest(allBooks.request, { realityId: 3 });

            result.allBooks.forEach((book: { author: any }) => {
                expect(book.author).toBeNull();
            });
        });
    });
});
