import {
    Edge,
    DeleteResult,
    getPolarisConnectionManager,
    Like,
    OnlinePaginatedResolver,
    SnapshotPaginatedResolver,
    PolarisError,
    PolarisGraphQLContext,
    PageConnection,
} from '@enigmatis/polaris-core';
import { PubSub } from 'apollo-server-express';
import { TestContext } from '../../shared-resources/context/test-context';
import { Author } from '../../shared-resources/entities/author';
import { Book } from '../../shared-resources/entities/book';
import { polarisGraphQLLogger } from '../../shared-resources/logger';
import { Pen } from '../../shared-resources/entities/pen';
import { Chapter } from '../../shared-resources/entities/chapter';
import { Review } from '../../shared-resources/entities/review';

const pubsub = new PubSub();
const BOOK_UPDATED = 'BOOK_UPDATED';

export const resolvers = {
    Query: {
        allBooks: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Book[]> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            polarisGraphQLLogger.debug("I'm the resolver of all books", context);
            return connection
                .getRepository(Book)
                .find(context, { relations: ['author', 'reviews'] });
        },
        authors: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Author[]> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return connection.getRepository(Author).find(context, {});
        },
        allBooksPaginatedWithException: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<SnapshotPaginatedResolver<Book>> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return {
                getData: async (startIndex?: number, pageSize?: number): Promise<Book[]> => {
                    if (startIndex && startIndex >= 25) {
                        context.returnedExtensions.warnings = ['warning 1', 'warning 2'];
                        throw new Error('all books paginated error');
                    }
                    return connection.getRepository(Book).find(context, {
                        relations: ['author'],
                        skip: startIndex,
                        take: pageSize,
                    });
                },
                totalCount: async (): Promise<number> => {
                    return connection.getRepository(Book).count(context);
                },
            };
        },
        allBooksPaginated: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<SnapshotPaginatedResolver<Book>> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            polarisGraphQLLogger.debug("I'm the resolver of all books", context);
            return {
                getData: async (startIndex?: number, pageSize?: number): Promise<Book[]> => {
                    return connection.getRepository(Book).find(context, {
                        relations: ['author'],
                        skip: startIndex,
                        take: pageSize,
                    });
                },
                totalCount: async (): Promise<number> => {
                    return connection.getRepository(Book).count(context);
                },
            };
        },
        allBooksWithWarnings: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Book[]> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            context.returnedExtensions.warnings = ['warning 1', 'warning 2'];
            return connection.getRepository(Book).find(context, { relations: ['author'] });
        },
        bookById: (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Book | undefined> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return connection.getRepository(Book).findOne(context, args.id);
        },
        bookByTitle: (parent: any, args: any, context: PolarisGraphQLContext): Promise<Book[]> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return connection.getRepository(Book).find(context, {
                where: { title: Like(`%${args.title}%`) },
                relations: ['author'],
            });
        },
        authorsByFirstName: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Author[]> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return connection
                .getRepository(Author)
                .find(context, { where: { firstName: Like(`%${args.name}%`) } });
        },
        authorById: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Author | undefined> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return connection
                .getRepository(Author)
                .findOne(context, { where: { id: args.id }, relations: ['books'] }, {});
        },
        authorsByFirstNameFromCustomHeader: async (
            parent: any,
            args: any,
            context: TestContext,
        ): Promise<Author[]> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return connection.getRepository(Author).find(context, {
                where: { firstName: Like(`%${context.requestHeaders.customHeader}%`) },
            });
        },
        customContextCustomField: (parent: any, args: any, context: TestContext): number =>
            context.customField,
        customContextInstanceMethod: (parent: any, args: any, context: TestContext): string =>
            context.instanceInContext.doSomething(),
        permissionsField: () => 'foo bar baz',
        permissionsFieldWithHeader: () => 'hello world!',
        onlinePaginatedBooks: async (
            parent: any,
            args: any,
            context: TestContext,
        ): Promise<PageConnection<Book>> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            let books = await connection.getRepository(Book).find(context);
            books.sort((book1, book2) => (book1.getId() > book2.getId() ? 1 : -1));
            const copyOfBooks = Array(...books);
            if (args.pagingArgs.after) {
                books = books.filter((book) => book.getId() > args.pagingArgs.after);
            }
            if (args.pagingArgs.before) {
                books = books.filter((book) => book.getId() < args.pagingArgs.before);
            }
            if (args.pagingArgs.first) {
                books = books.slice(0, Math.min(books.length, Number(args.pagingArgs.first)));
            } else if (args.pagingArgs.last) {
                books = books.slice(
                    Math.max(0, books.length - Number(args.pagingArgs.last)),
                    books.length,
                );
            }
            const edges: Edge<Book>[] = [];
            books.forEach((book) => {
                edges.push({ node: book, cursor: book.getId() });
            });
            return {
                pageInfo: {
                    startCursor: books[0].getId(),
                    endCursor: books[books.length - 1].getId(),
                    hasNextPage:
                        copyOfBooks.indexOf(books[books.length - 1]) + 1 < copyOfBooks.length,
                    hasPreviousPage: copyOfBooks.indexOf(books[0]) > 0,
                },
                edges,
            };
        },
        bookByDate: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Book[] | undefined> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return connection
                .getRepository(Book)
                .find(context, { relations: ['author', 'reviews'] });
        },
        onlinePaginatedAuthors: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<OnlinePaginatedResolver<Author>> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return {
                getData: async (): Promise<Author[]> => {
                    return connection.getRepository(Author).findSortedByDataVersion(context, {
                        relations: ['books'],
                    });
                },
            };
        },
    },
    Mutation: {
        createAuthor: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Author | undefined> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            const authorRepo = connection.getRepository(Author);
            const newAuthor = new Author(args.firstName, args.lastName);
            const authorSaved = await authorRepo.save(context, newAuthor);
            return authorSaved instanceof Array ? authorSaved[0] : authorSaved;
        },
        createManyAuthors: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<boolean> => {
            for (let i = 1; i <= 15; i++) {
                const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
                const authorRepo = connection.getRepository(Author);
                const newAuthor = new Author(`Ron${i}`, `Katz`);
                await authorRepo.save(context, newAuthor);
            }
            return true;
        },
        fail: async () => {
            throw new PolarisError('fail', 404);
        },
        createBook: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Book | undefined> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            const authorRepo = connection.getRepository(Author);
            const bookRepo = connection.getRepository(Book);
            const author = await authorRepo.findOne(context, { where: { id: args.authorId } });
            const newBook = new Book(args.title, author);
            const bookSaved = await bookRepo.save(context, newBook);
            return bookSaved instanceof Array ? bookSaved[0] : bookSaved;
        },
        createPen: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Pen | undefined> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            const authorRepo = connection.getRepository(Author);
            const penRepo = connection.getRepository(Pen);
            const author = await authorRepo.findOne(context, { where: { id: args.id } });
            const newPen = new Pen(args.color, author);
            const penSaved = await penRepo.save(context, newPen);
            return penSaved instanceof Array ? penSaved[0] : penSaved;
        },
        createChapter: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Chapter | undefined> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            const bookRepo = connection.getRepository(Book);
            const chapterRepo = connection.getRepository(Chapter);
            const book = await bookRepo.findOne(context, { where: { id: args.bookId } });
            const newChapter = new Chapter(args.number, book);
            const chapterSaved = await chapterRepo.save(context, newChapter);
            return chapterSaved instanceof Array ? chapterSaved[0] : chapterSaved;
        },
        createReview: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Review | undefined> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            const bookRepo = connection.getRepository(Book);
            const reviewRepo = connection.getRepository(Review);
            const book = await bookRepo.findOne(context, { where: { id: args.bookId } });
            if (book) {
                const newReview = new Review(
                    args.description,
                    args.rating,
                    book,
                    args.reviewKind?.site,
                    args.reviewKind?.name,
                );
                const reviewSaved = await reviewRepo.save(context, newReview as any);
                return reviewSaved instanceof Array ? reviewSaved[0] : reviewSaved;
            }
            return undefined;
        },
        updateBooksByTitle: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Book[]> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            const bookRepo = connection.getRepository(Book);
            const result: Book[] = await bookRepo.find(context, {
                where: { title: Like(`%${args.title}%`) },
            });

            result.forEach((book) => (book.title = args.newTitle));
            await bookRepo.save(context, result);
            result.forEach((book) => pubsub.publish(BOOK_UPDATED, { bookUpdated: book }));
            return result;
        },
        deleteBook: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<boolean> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            const bookRepo = connection.getRepository(Book);
            const result: DeleteResult = await bookRepo.delete(context, args.id);
            return (
                result &&
                result.affected !== null &&
                result.affected !== undefined &&
                result.affected > 0
            );
        },
        deleteAuthor: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<boolean> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            const authorRepos = connection.getRepository(Author);
            const result: DeleteResult = await authorRepos.delete(context, args.id);
            return (
                result &&
                result.affected !== null &&
                result.affected !== undefined &&
                result.affected > 0
            );
        },
    },
    Subscription: {
        bookUpdated: {
            subscribe: () => pubsub.asyncIterator([BOOK_UPDATED]),
        },
    },
    Review: {
        __resolveType(obj: any) {
            if (obj.site) {
                return 'ProfessionalReview';
            } else {
                return 'SimpleReview';
            }
        },
    },
};
