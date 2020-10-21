import { graphQLRequest } from '../test-utils/graphql-client';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as createChapterReq from './jsonRequestsAndHeaders/createChapter.json';
import * as createPenReq from './jsonRequestsAndHeaders/createPen.json';
import { createServers } from '../test-utils/tests-servers-util';
import * as authors from './jsonRequestsAndHeaders/authors.json';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createReviewReq from './jsonRequestsAndHeaders/createReview.json';

export const createReview = async (bookId: string, site: boolean) => {
    const reviewKind = site ? { site: 'medium' } : { name: 'chen' };
    await graphQLRequest(createReviewReq.request, undefined, {
        description: 'very fun book',
        rating: '4.5',
        bookId,
        reviewKind,
    });
};
export const createAuthorAndBook: () => Promise<{ authorId: any; bookId: any }> = async () => {
    const author = { firstName: 'first1', lastName: 'last' };
    const result = await graphQLRequest(createAuthor.request, undefined, author); // dv 2
    const result2 = await graphQLRequest(createBook.request, undefined, {
        title: 'book',
        authorId: result.createAuthor.id,
    }); // dv is 3
    return { authorId: result.createAuthor.id, bookId: result2.createBook.id };
};
export const createChapter = async (bookId: string) => {
    await graphQLRequest(createChapterReq.request, undefined, {
        number: 1,
        bookId,
    });
};
export const createPen = async (authorId: string) => {
    await graphQLRequest(createPenReq.request, undefined, {
        color: 'RED',
        authorId,
    });
};
describe('data version specification tests', () => {
    describe('testing filter with changed mapping', () => {
        test.each(createServers())(
            'should filter entities below the requested data version',
            async (server) => {
                await server.start();
                await createAuthorAndBook();
                const result = await graphQLRequest(authors.request, { 'data-version': 2 });
                expect(result.authors.length).toEqual(0);
                await server.stop();
            },
        );
        test.each(createServers())(
            'only root entity in mapping, ask with dv smaller than root dv, entity is returned',
            async (server) => {
                await server.start();
                await createAuthorAndBook();
                const result = await graphQLRequest(authors.request, { 'data-version': 1 });
                expect(result.authors.length).toEqual(1);
                await server.stop();
            },
        );
        test.each(createServers())(
            'ask with dv grandChild dv, grandchild not in mapping, entity is not returned',
            async (server) => {
                await server.start();

                const { bookId } = await createAuthorAndBook();
                await createChapter(bookId);
                const result = await graphQLRequest(authors.requestBooksWithoutChapters, {
                    'data-version': 3,
                });
                expect(result.authors.length).toEqual(0);

                await server.stop();
            },
        );
        test.each(createServers())(
            'pen entity not in mapping, ask with dv smaller than pen, entity is not returned',
            async (server) => {
                await server.start();

                const { bookId, authorId } = await createAuthorAndBook();
                await createChapter(bookId);
                await createPen(authorId);
                const result = await graphQLRequest(authors.requestBooksWithChapters, {
                    'data-version': 4,
                });
                expect(result.authors.length).toEqual(0);

                await server.stop();
            },
        );
    });
    describe('testing filter, all fields are mapped', () => {
        test.each(createServers())('ask with root dv, entity is returned', async (server) => {
            await server.start();
            await createAuthorAndBook();
            const result = await graphQLRequest(authors.requestAll, { 'data-version': 1 });
            expect(result.authors.length).toEqual(1);
            await server.stop();
        });
        test.each(createServers())('ask with child dv, entity is returned', async (server) => {
            await server.start();
            await createAuthorAndBook();
            const result = await graphQLRequest(authors.requestAll, { 'data-version': 2 });
            expect(result.authors.length).toEqual(1);
            await server.stop();
        });

        test.each(createServers())(
            'ask with dv grandChild dv, entity is returned',
            async (server) => {
                await server.start();
                const { authorId } = await createAuthorAndBook();
                await createPen(authorId);
                const result = await graphQLRequest(authors.requestAll, { 'data-version': 3 });
                expect(result.authors.length).toEqual(1);
                await server.stop();
            },
        );
        test.each(createServers())(
            'ask with dv bigger than grandChild dv, entity is not returned',
            async (server) => {
                await server.start();
                await createAuthorAndBook();
                const result = await graphQLRequest(authors.requestAll, { 'data-version': 4 });
                expect(result.authors.length).toEqual(0);
                await server.stop();
            },
        );
        test.each(createServers())(
            'ask with dv of second child entity, entity is returned',
            async (server) => {
                await server.start();
                const { authorId, bookId } = await createAuthorAndBook();
                await createChapter(bookId);
                await createPen(authorId);
                const result = await graphQLRequest(authors.requestAll, { 'data-version': 4 });
                expect(result.authors.length).toEqual(1);
                await server.stop();
            },
        );
    });
    describe('testing parsing of request', () => {
        test.each(createServers())(
            'ask in inline fragment format, entity is returned',
            async (server) => {
                await server.start();
                const { authorId } = await createAuthorAndBook();
                await createPen(authorId);
                const result = await graphQLRequest(authors.requestAllInlineFragment, {
                    'data-version': 3,
                });
                expect(result.authors.length).toEqual(1);
                await server.stop();
            },
        );
        test.each(createServers())('ask in fragment format, entity is returned', async (server) => {
            await server.start();
            const { authorId } = await createAuthorAndBook();
            await createPen(authorId);
            const result = await graphQLRequest(authors.requestAllFragment, { 'data-version': 3 });
            expect(result.authors.length).toEqual(1);
            await server.stop();
        });
        test.each(createServers())(
            'ask with dv of child entity, get all child entities',
            async (server) => {
                await server.start();
                const { bookId } = await createAuthorAndBook();
                await createReview(bookId, true); // dv 4
                await createReview(bookId, false); // dv 5
                const result = await graphQLRequest(allBooks.requestWithReviews, {
                    'data-version': 4,
                });
                expect(result.allBooks[0].reviews.length).toEqual(2);
                await server.stop();
            },
        );
    });
});
