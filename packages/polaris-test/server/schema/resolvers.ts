import {
    DeleteResult,
    getPolarisConnectionManager,
    Like,
    PaginatedResolver,
    PolarisError,
    PolarisGraphQLContext,
} from '@enigmatis/polaris-core';
import { PubSub } from 'apollo-server-express';
import { TestContext } from '../../shared-resources/context/test-context';
import { Author } from '../../shared-resources/entities/author';
import { Book } from '../../shared-resources/entities/book';
import { polarisGraphQLLogger } from '../../shared-resources/logger';

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
            return connection.getRepository(Book).find(context, { relations: ['author'] });
        },
        allBooksPaginated: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<PaginatedResolver<Book>> => {
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
};
