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
import { Pool, PoolClient } from 'pg';

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
            polarisGraphQLLogger.debug("I'm the resolver of all books", context);
            return {
                getData: async (startIndex?: number, pageSize?: number): Promise<Book[]> => {
                    const client = context.connectionLessQueryExecutorClient as PoolClient;
                    const getBooksIdsQuery = `SELECT DISTINCT "da"."Book_id" as "bookId"
FROM (SELECT "Book"."dataVersion", "Book"."realityId", "Book"."createdBy", "Book"."creationTime", "Book"."lastUpdatedBy", "Book"."lastUpdateTime", "Book"."deleted", "Book"."title", "Book"."id" as "Book_id" , "Book"."authorId", "Book__author"."dataVersion", "Book__author"."realityId", "Book__author"."createdBy", "Book__author"."creationTime", "Book__author"."lastUpdatedBy", "Book__author"."lastUpdateTime", "Book__author"."deleted", "Book__author"."firstName", "Book__author"."lastName", "Book__author"."id" 
      FROM "${process.env.SCHEMA_NAME}"."book" "Book" LEFT JOIN "${process.env.SCHEMA_NAME}"."author" "Book__author" ON "Book__author"."id"="Book"."authorId" 
      WHERE "Book"."deleted" = false AND "Book"."realityId" = ${context.requestHeaders.realityId}) "da"
ORDER BY "Book_id" ASC LIMIT ${pageSize} OFFSET ${startIndex}`;
                    if (client) {
                        return client.query(getBooksIdsQuery).then((res) => {
                            const ids = res.rows.map((value) => "'" + value.bookId + "'").join(',');
                            return client
                                .query(
                                    `SELECT "Book"."dataVersion", "Book"."realityId", "Book"."createdBy", "Book"."creationTime" , "Book"."lastUpdatedBy", "Book"."lastUpdateTime", "Book"."deleted", "Book"."title", "Book"."id", "Book"."authorId"
FROM "${process.env.SCHEMA_NAME}"."book" "Book" LEFT JOIN "${process.env.SCHEMA_NAME}"."author" "Book__author" ON "Book__author"."id"="Book"."authorId" 
WHERE ("Book"."deleted" = false AND "Book"."realityId" = ${context.requestHeaders.realityId}) AND "Book"."id" IN (${ids})`,
                                )
                                .then((res1) => {
                                    const books: Book[] = [];
                                    res1.rows.forEach((book) => {
                                        const newBook = new Book(book.title);
                                        Object.assign(newBook, book);
                                        books.push(newBook);
                                    });
                                    return books;
                                });
                        });
                    } else {
                        const pool = new Pool({
                            connectionString: process.env.CONNECTION_STRING,
                            database: 'postgres',
                            port: 5432,
                        });
                        return pool.query(getBooksIdsQuery).then((res) => {
                            const ids = res.rows.map((value) => "'" + value.bookId + "'").join(',');
                            return pool
                                .query(
                                    `SELECT "Book"."dataVersion", "Book"."realityId", "Book"."createdBy", "Book"."creationTime" , "Book"."lastUpdatedBy", "Book"."lastUpdateTime", "Book"."deleted", "Book"."title", "Book"."id", "Book"."authorId"
FROM "${process.env.SCHEMA_NAME}"."book" "Book" LEFT JOIN "${process.env.SCHEMA_NAME}"."author" "Book__author" ON "Book__author"."id"="Book"."authorId" 
WHERE ("Book"."deleted" = false AND "Book"."realityId" = ${context.requestHeaders.realityId}) AND "Book"."id" IN (${ids})`,
                                )
                                .then((res1) => {
                                    const books: Book[] = [];
                                    res1.rows.forEach((book) => {
                                        const newBook = new Book(book.title);
                                        Object.assign(newBook, book);
                                        books.push(newBook);
                                    });
                                    return books;
                                });
                        });
                    }
                },
                totalCount: async (): Promise<number> => {
                    const pool = new Pool({
                        connectionString: process.env.CONNECTION_STRING,
                        database: 'postgres',
                        port: 5432,
                    });
                    return pool
                        .query(
                            `SELECT COUNT(DISTINCT("Book"."id")) FROM "${process.env.SCHEMA_NAME}"."book" "Book" WHERE "Book"."deleted" = false AND "Book"."realityId" = ${context.requestHeaders.realityId}`,
                        )
                        .then((res) => {
                            return Number(res.rows[0].count);
                        });
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
