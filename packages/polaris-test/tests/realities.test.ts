import { graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import { polarisTest } from '../test-utils/polaris-test';

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
    test.each(createServers())(
        'should set reality of the entity from the header',
        async (server) => {
            await polarisTest(server, async () => {
                const result: any = await graphQLRequest(
                    createAuthor.request,
                    realityHeader,
                    author,
                );
                expect(result.createAuthor.realityId).toEqual(realityId);
            });
        },
    );
    test.each(createServers())(
        'should filter entities for the specific reality',
        async (server) => {
            await polarisTest(server, async () => {
                await graphQLRequest(createBook.request, realityHeader, { title });
                const result: any = await graphQLRequest(allBooks.request, realityHeader);
                result.allBooks.forEach((book: { realityId: number }) => {
                    expect(book.realityId).toEqual(realityId);
                });
            });
        },
    );

    describe('include linked operational entities', () => {
        test.each(createServers())(
            'should link operational entities if set to true',
            async (server) => {
                await polarisTest(server, async () => {
                    const authorId = ((await graphQLRequest(
                        createAuthor.request,
                        {},
                        createAuthor.variables,
                    )) as any).createAuthor.id;
                    await graphQLRequest(createBook.request, includeOperAndRealityHeader, {
                        title,
                        authorId,
                    });
                    const result: any = await graphQLRequest(
                        allBooks.request,
                        includeOperAndRealityHeader,
                    );
                    result.allBooks.forEach(
                        (book: { realityId: number; author: { realityId: number } }) => {
                            expect(book.realityId).toBe(realityId);
                            expect(book.author.realityId).toBe(defaultRealityId);
                        },
                    );
                });
            },
        );
        test.each(createServers())(
            'should filter operational entities if set to false',
            async (server) => {
                await polarisTest(server, async () => {
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
            },
        );
    });
});
