import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as createPen from './jsonRequestsAndHeaders/createPen.json';
import * as authorsByFirstName from './jsonRequestsAndHeaders/authorsByFirstName.json';

const authorName = { firstName: 'Amos', lastName: 'Oz' };

describe('data version tests', () => {
    describe('data version in response', () => {
        test.each(createServers())('should return the data version in response', async (server) => {
            await server.start();
            const response = await graphqlRawRequest(allBooks.request);
            expect(response.extensions.globalDataVersion).toBeDefined();
            expect(response.extensions.globalDataVersion).toEqual(1);
            await server.stop();
        });
        test.each(createServers())(
            'should increment the data version on db updates',
            async (server) => {
                await server.start();
                const books: any = await graphqlRawRequest(allBooks.request);
                const dataVersionBeforeUpdate = books.extensions.globalDataVersion;
                await graphqlRawRequest(createAuthor.request, {}, authorName);
                const books2: any = await graphqlRawRequest(allBooks.request);
                const dataVersionAfterUpdate = books2.extensions.globalDataVersion;
                expect(dataVersionAfterUpdate - 1).toEqual(dataVersionBeforeUpdate);
                await server.stop();
            },
        );
        test.each(createServers())(
            'should increment only once for the same context',
            async (server) => {
                await server.start();
                const books: any = await graphqlRawRequest(allBooks.request);
                const dataVersionBeforeUpdate = books.extensions.globalDataVersion;
                await graphQLRequest(createAuthor.requestTwo, {}, authorName);
                const books2: any = await graphqlRawRequest(allBooks.request);
                const dataVersionAfterUpdate = books2.extensions.globalDataVersion;
                expect(dataVersionAfterUpdate - 1).toEqual(dataVersionBeforeUpdate);
                await server.stop();
            },
        );
    });
    describe('data version filtering', () => {
        test.each(createServers())(
            'should filter entities below the requested data version',
            async (server) => {
                await server.start();
                const titles = ['book', 'book2'];
                await graphQLRequest(createBook.request, undefined, { title: titles[0] });
                await graphQLRequest(createBook.request, undefined, { title: titles[1] });
                const response: any = await graphQLRequest(allBooks.request, { 'data-version': 2 });
                expect(response.allBooks.length).toEqual(1);
                expect(response.allBooks[0].title).toEqual(titles[1]);
                await server.stop();
            },
        );
    });
    describe('data version specification tests', () => {
        test.each(createServers())(
            'should filter entities below the requested data version',
            async (server) => {
                await server.start();
                const titles = ['book', 'book2'];
                const author = { firstName: 'first1', lastName: 'last' };
                const result = await graphQLRequest(createAuthor.request, undefined, author);
                await graphQLRequest(createBook.request, undefined, {
                    title: titles[0],
                    authorId: result.createAuthor.id,
                });
                await graphQLRequest(createPen.request, undefined, {
                    color: 'RED',
                    authorId: result.createAuthor.id,
                });
                const response: any = await graphQLRequest(
                    authorsByFirstName.request,
                    {
                        'data-version': 2,
                    },
                    { name: author.firstName },
                );
                expect(response.authorsByFirstName.length).toEqual(1);
                await server.stop();
            },
        );
    });
});
