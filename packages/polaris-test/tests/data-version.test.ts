import { graphqlRawRequest, graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import { polarisTest } from '../test-utils/polaris-test';

const authorName = { firstName: 'Amos', lastName: 'Oz' };

describe('data version tests', () => {
    describe('data version in response', () => {
        test.each(createServers())('should return the data version in response', async (server) => {
            await polarisTest(server, async () => {
                const response = await graphqlRawRequest(allBooks.request);
                expect(response.extensions.dataVersion).toBeDefined();
                expect(response.extensions.dataVersion).toEqual(1);
            });
        });
        test.each(createServers())(
            'should increment the data version on db updates',
            async (server) => {
                await polarisTest(server, async () => {
                    const books: any = await graphqlRawRequest(allBooks.request);
                    const dataVersionBeforeUpdate = books.extensions.dataVersion;
                    await graphqlRawRequest(createAuthor.request, {}, authorName);
                    const books2: any = await graphqlRawRequest(allBooks.request);
                    const dataVersionAfterUpdate = books2.extensions.dataVersion;
                    expect(dataVersionAfterUpdate - 1).toEqual(dataVersionBeforeUpdate);
                });
            },
        );
        test.each(createServers())(
            'should increment only once for the same context',
            async (server) => {
                await polarisTest(server, async () => {
                    const books: any = await graphqlRawRequest(allBooks.request);
                    const dataVersionBeforeUpdate = books.extensions.dataVersion;
                    await graphQLRequest(createAuthor.requestTwo, {}, authorName);
                    const books2: any = await graphqlRawRequest(allBooks.request);
                    const dataVersionAfterUpdate = books2.extensions.dataVersion;
                    expect(dataVersionAfterUpdate - 1).toEqual(dataVersionBeforeUpdate);
                });
            },
        );
    });
    describe('data version filtering', () => {
        test.each(createServers())(
            'should filter entities below the requested data version',
            async (server) => {
                await polarisTest(server, async () => {
                    const titles = ['book', 'book2'];
                    await graphQLRequest(createBook.request, undefined, { title: titles[0] });
                    await graphQLRequest(createBook.request, undefined, { title: titles[1] });
                    const response: any = await graphQLRequest(allBooks.request, {
                        'data-version': 2,
                    });
                    expect(response.allBooks.length).toEqual(1);
                    expect(response.allBooks[0].title).toEqual(titles[1]);
                });
            },
        );
    });
});
