import { resolvers as importedResolvers } from '../../server/schema/resolvers';
import { PolarisGraphQLContext } from '../../../polaris-common/src';
import { SnapshotPaginatedResolver } from '@enigmatis/polaris-core';
import { Book } from '../../shared-resources/entities/book';
import { polarisGraphQLLogger } from '../../shared-resources/logger';
import { Pool, PoolClient } from 'pg';

importedResolvers.Query.allBooksPaginated = async (
    parent: any,
    args: any,
    context: PolarisGraphQLContext,
): Promise<SnapshotPaginatedResolver<Book>> => {
    polarisGraphQLLogger.debug("I'm the resolver of all books", context);
    return {
        getData: async (startIndex?: number, pageSize?: number): Promise<Book[]> => {
            const client = context.connectionlessQueryExecutorClient as PoolClient;
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
};

export const resolvers = importedResolvers;
