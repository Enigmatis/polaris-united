import { graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as booksByTitle from './jsonRequestsAndHeaders/booksByTitle.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as deleteAuthor from './jsonRequestsAndHeaders/deleteAuthor.json';
import * as deleteBook from './jsonRequestsAndHeaders/deleteBook.json';
import { polarisTest } from '../test-utils/polaris-test';

const title = 'Book4';
const name = { firstName: 'Author1', lastName: 'Author1' };
describe('soft delete tests', () => {
    test.each(createServers())('should filter deleted entities', async (server) => {
        await polarisTest(server, async () => {
            await graphQLRequest(createBook.request, {}, { title });
            const bookToDelete: any = await graphQLRequest(booksByTitle.request, {}, { title });
            await graphQLRequest(deleteBook.request, deleteBook.headers, {
                id: bookToDelete.bookByTitle[0].id,
            });
            const afterBookDeletionResponse: any = await graphQLRequest(
                booksByTitle.request,
                {},
                { title },
            );
            expect(afterBookDeletionResponse.bookByTitle.length).toBe(0);
        });
    });
    test.each(createServers())(
        'should delete linked entities to deleted entities',
        async (server) => {
            await polarisTest(server, async () => {
                const author: any = await graphQLRequest(createAuthor.request, {}, name);
                await graphQLRequest(
                    createBook.request,
                    {},
                    { title, authorId: author.createAuthor.id },
                );
                await graphQLRequest(deleteAuthor.request, deleteAuthor.headers, {
                    id: author.createAuthor.id,
                });
                const afterBookDeletionResponse: any = await graphQLRequest(
                    booksByTitle.request,
                    {},
                    { title: '1' },
                );
                expect(afterBookDeletionResponse.bookByTitle.length).toBe(0);
            });
        },
    );
});
