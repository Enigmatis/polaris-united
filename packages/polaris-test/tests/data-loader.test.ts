import { graphQLRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooksWithChaptersDataFetcher from './jsonRequestsAndHeaders/allBooksWithChaptersDataFetcher.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as createChapter from './jsonRequestsAndHeaders/createChapter.json';
import { polarisTest } from '../test-utils/polaris-test';

describe('simple queries', () => {
    test.each(createServers())(
        'create chapters, fetch books with data loader, chapter returns correctly',
        async (server) => {
            await polarisTest(server, async () => {
                const book = await graphQLRequest(createBook.request, {}, { title: 'Ron' });
                const firstChapter = await graphQLRequest(
                    createChapter.request,
                    {},
                    { number: 1, bookId: book.createBook.id },
                );
                const secondChapter = await graphQLRequest(
                    createChapter.request,
                    {},
                    { number: 2, bookId: book.createBook.id },
                );
                const result: any = await graphQLRequest(allBooksWithChaptersDataFetcher.request);
                const createdChapters = [firstChapter.createChapter, secondChapter.createChapter];
                const fetchedChapters = result.allBooks[0].chapters;
                expect(createdChapters).toStrictEqual(fetchedChapters);
            });
        },
    );
});
