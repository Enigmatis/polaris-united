import {
    ConnectionlessIrrelevantEntitiesCriteria,
    createPolarisConnection,
    DataVersion,
    ExpressContext,
    getPolarisConnectionManager,
    LoggerLevel,
    PageConnection,
    PolarisGraphQLContext,
    PolarisServer,
    PolarisServerOptions,
    RealitiesHolder,
    SnapshotMetadata,
    SnapshotPage,
    SnapshotPaginatedResolver,
} from '@enigmatis/polaris-core';
import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as polarisProperties from '../shared-resources/polaris-properties.json';
import * as customContextFields from '../shared-resources/constants/custom-context-fields.json';
import { polarisGraphQLLogger } from '../shared-resources/logger';
import { TestContext } from '../shared-resources/context/test-context';
import { typeDefs } from '../server/schema/type-defs';
import { resolvers } from './schema/resolvers';
import { connectionOptions } from '../shared-resources/connection-options';
import { TestClassInContext } from '../shared-resources/context/test-class-in-context';
import { Book } from '../shared-resources/entities/book';
import { Author } from '../shared-resources/entities/author';
import { realitiesConfig } from '../shared-resources/realities-holder';
import { Review } from '../shared-resources/entities/review';
import { Pen } from '../shared-resources/entities/pen';
import { Chapter } from '../shared-resources/entities/chapter';

const customContext = (context: ExpressContext): Partial<TestContext> => {
    const { req, connection } = context;
    const headers = req ? req.headers : connection?.context;

    return {
        customField: customContextFields.customField,
        instanceInContext: new TestClassInContext(
            customContextFields.instanceInContext.someProperty,
        ),
        requestHeaders: {
            customHeader: headers['custom-header'],
        },
    };
};

export async function startConnectionlessTestServer(
    config?: Partial<PolarisServerOptions>,
): Promise<PolarisServer> {
    await createPolarisConnection(connectionOptions, polarisGraphQLLogger as any);
    const options = { ...getDefaultTestServerConfig(), ...config };
    const server = new PolarisServer(options);
    await server.start();
    return server;
}

export async function stopConnectionlessTestServer(server: PolarisServer): Promise<void> {
    await server.stop();
    const connectionManager = getPolarisConnectionManager();
    if (connectionManager.connections.length > 0) {
        for (const connection of connectionManager.connections) {
            await connectionManager.get(connection.name).close();
        }
    }
}

const getDefaultTestServerConfig = (): {
    typeDefs: string;
    resolvers: {
        Query: {
            allBooksPaginatedWithException: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<SnapshotPaginatedResolver<Book>>;
            allBooksWithWarnings: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Book[]>;
            customContextCustomField: (parent: any, args: any, context: TestContext) => number;
            authorsByFirstName: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Author[]>;
            authorById: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Author | undefined>;
            permissionsField: () => string;
            authorsByFirstNameFromCustomHeader: (
                parent: any,
                args: any,
                context: TestContext,
            ) => Promise<Author[]>;
            allBooksPaginated: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<SnapshotPaginatedResolver<Book>>;
            bookByTitle: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Book[]>;
            bookById: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Book | undefined>;
            customContextInstanceMethod: (parent: any, args: any, context: TestContext) => string;
            permissionsFieldWithHeader: () => string;
            onlinePaginatedBooks: (
                parent: any,
                args: any,
                context: TestContext,
            ) => Promise<PageConnection<Book>>;
            allBooks: (parent: any, args: any, context: PolarisGraphQLContext) => Promise<Book[]>;
            bookByDate: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Book[] | undefined>;
            authors: (parent: any, args: any, context: PolarisGraphQLContext) => Promise<Author[]>;
        };
        Mutation: {
            fail: () => Promise<void>;
            createBook: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Book | undefined>;
            deleteBook: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<boolean>;
            createChapter: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Chapter | undefined>;
            updateBooksByTitle: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Book[]>;
            createAuthor: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Author | undefined>;
            createPen: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Pen | undefined>;
            createReview: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<Review | undefined>;
            deleteAuthor: (
                parent: any,
                args: any,
                context: PolarisGraphQLContext,
            ) => Promise<boolean>;
        };
        Review: { __resolveType(obj: any): string };
        Subscription: { bookUpdated: { subscribe: () => any } };
    };
    customContext: (context: ExpressContext) => Partial<TestContext>;
    port: number;
    logger: { writeToConsole: boolean; loggerLevel: any };
    connectionManager: any;
    connectionLessConfiguration: {
        saveSnapshotPages(pages: SnapshotPage[]): Promise<void>;
        getSnapshotMetadataById(id: string): Promise<SnapshotMetadata | undefined>;
        startTransaction(): Promise<PoolClient>;
        getSnapshotPageById(id: string): Promise<SnapshotPage>;
        rollbackTransaction(client?: any): Promise<void>;
        updateSnapshotMetadata(
            metadataId: string,
            metadataToUpdate: Partial<SnapshotMetadata>,
        ): Promise<void>;
        deleteSnapshotPageBySecondsToBeOutdated(secondsToBeOutdated: number): Promise<void>;
        updateSnapshotPage(pageId: string, pageToUpdate: Partial<SnapshotPage>): Promise<void>;
        getIrrelevantEntities(
            typeName: string,
            criteria: ConnectionlessIrrelevantEntitiesCriteria,
            lastDataVersion: number | undefined,
            isLastPage: boolean | undefined,
        ): Promise<any[]>;
        commitTransaction(client?: any): Promise<void>;
        getDataVersion(): Promise<DataVersion>;
        deleteSnapshotMetadataBySecondsToBeOutdated(secondsToBeOutdated: number): Promise<void>;
        saveSnapshotMetadata(metadata: SnapshotMetadata): Promise<SnapshotMetadata>;
    };
    supportedRealities: RealitiesHolder;
} => {
    return {
        typeDefs,
        resolvers,
        customContext,
        port: polarisProperties.port,
        logger: { loggerLevel: LoggerLevel.WARN, writeToConsole: true },
        supportedRealities: new RealitiesHolder(new Map(realitiesConfig)),
        connectionManager: getPolarisConnectionManager(),
        connectionLessConfiguration: {
            async getDataVersion(): Promise<DataVersion> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                const query =
                    'SELECT "DataVersion"."id" AS "id", "DataVersion"."value" AS "value" \n' +
                    `FROM "${process.env.SCHEMA_NAME}"."data_version" "DataVersion" LIMIT 1`;
                return pool.query(query).then((res) => {
                    const dataVersion = new DataVersion(res.rows[0].value);
                    pool.end();
                    return dataVersion;
                });
            },
            async getIrrelevantEntities(
                typeName: string,
                criteria: ConnectionlessIrrelevantEntitiesCriteria,
                lastDataVersion: number | undefined,
                isLastPage: boolean | undefined,
            ): Promise<any[]> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                let query =
                    `SELECT * FROM "${process.env.SCHEMA_NAME}"."book" "${typeName}" \n` +
                    `WHERE "${typeName}"."realityId" = ${criteria.realityId} \n` +
                    `AND "${typeName}"."dataVersion" > ${criteria.dataVersionThreshold} \n`;
                if (lastDataVersion && isLastPage === false) {
                    query += `AND "${typeName}"."dataVersion" < ${lastDataVersion} \n`;
                }
                if (criteria.notInIds?.length > 0) {
                    query += `AND NOT("${typeName}"."id" IN ('${criteria.notInIds?.join(',')}'))`;
                }
                return pool.query(query).then((res) => {
                    const irrelevantEntities: any[] = [];
                    if (typeName === 'Book') {
                        res.rows.forEach((value) => {
                            const book = new Book(
                                value.title,
                                new Author('first', 'last'),
                                value.id,
                            );
                            irrelevantEntities.push(book);
                        });
                    } else {
                        res.rows.forEach((value) => {
                            irrelevantEntities.push(new Author(value.firstName, value.lastName));
                        });
                    }
                    pool.end();
                    return irrelevantEntities;
                });
            },
            async saveSnapshotPages(pages: SnapshotPage[]): Promise<void> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                const valuesToInsert: string[] = [];
                pages.forEach((page) => {
                    valuesToInsert.push(
                        `('${page.id}', DEFAULT, DEFAULT, '${page.status.toString()}')`,
                    );
                });
                const query =
                    `INSERT INTO "${process.env.SCHEMA_NAME}"."snapshot_page"("id", "data", "lastAccessedTime", "status") \n` +
                    `VALUES ${valuesToInsert.join(',')} RETURNING "id", "lastAccessedTime"`;
                await pool.query(query).then(() => {
                    pool.end();
                });
            },
            async saveSnapshotMetadata(metadata: SnapshotMetadata): Promise<SnapshotMetadata> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                const pagesIdsToInsert = `'{${metadata.pagesIds.join(',')}}'`;
                const uuidOfSnapshotMetadata = uuidv4().toString();
                const query = `INSERT INTO "${
                    process.env.SCHEMA_NAME
                }"."snapshot_metadata"("id", "lastAccessedTime", "pagesIds", "pagesCount", "currentPageIndex", "status", "irrelevantEntities", "dataVersion", "totalCount", "warnings", "errors", "creationTime")
                               VALUES ('${uuidOfSnapshotMetadata}', DEFAULT, ${pagesIdsToInsert}, ${
                    metadata.pagesCount
                }, ${metadata.currentPageIndex}, '${metadata.status.toString()}', DEFAULT, ${
                    metadata.dataVersion
                }, ${
                    metadata.totalCount
                }, DEFAULT, DEFAULT, DEFAULT) RETURNING "id", "lastAccessedTime", "creationTime" `;
                return pool.query(query).then(() => {
                    pool.end();
                    const snapshotMetadataToReturn = new SnapshotMetadata();
                    Object.assign(snapshotMetadataToReturn, { id: uuidOfSnapshotMetadata });
                    return snapshotMetadataToReturn;
                });
            },
            async getSnapshotPageById(id: string): Promise<SnapshotPage> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                const query = `SELECT "SnapshotPage"."id", "SnapshotPage"."data", "SnapshotPage"."lastAccessedTime", "SnapshotPage"."status"
                               FROM "${process.env.SCHEMA_NAME}"."snapshot_page" "SnapshotPage" WHERE "SnapshotPage"."id" IN ('${id}') LIMIT 1`;
                return pool.query(query).then((res) => {
                    pool.end();
                    const snapshotPage = new SnapshotPage(res.rows[0].id);
                    Object.assign(snapshotPage, res.rows[0]);
                    return snapshotPage;
                });
            },
            async getSnapshotMetadataById(id: string): Promise<SnapshotMetadata | undefined> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                const query = `SELECT "SnapshotMetadata"."id", "SnapshotMetadata"."lastAccessedTime", "SnapshotMetadata"."pagesIds", "SnapshotMetadata"."pagesCount", "SnapshotMetadata"."currentPageIndex", "SnapshotMetadata"."status", "SnapshotMetadata"."irrelevantEntities", "SnapshotMetadata"."dataVersion", "SnapshotMetadata"."totalCount", "SnapshotMetadata"."warnings", "SnapshotMetadata"."errors", "SnapshotMetadata"."creationTime"
                               FROM "${process.env.SCHEMA_NAME}"."snapshot_metadata" "SnapshotMetadata" WHERE "SnapshotMetadata"."id" IN ('${id}') LIMIT 1`;
                return pool.query(query).then((res) => {
                    pool.end();
                    if (res.rows[0]) {
                        const snapshotMetadata = new SnapshotMetadata();
                        Object.assign(snapshotMetadata, res.rows[0]);
                        return snapshotMetadata;
                    }
                    return undefined;
                });
            },
            async updateSnapshotPage(
                pageId: string,
                pageToUpdate: Partial<SnapshotPage>,
            ): Promise<void> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                const query = `UPDATE "${
                    process.env.SCHEMA_NAME
                }"."snapshot_page" SET "status" = '${
                    pageToUpdate.status
                }', "data" = decode('${pageToUpdate.data?.toString()}','escape'), "lastAccessedTime" = CURRENT_TIMESTAMP WHERE "id" IN ('${pageId}') `;
                await pool.query(query).then(() => {
                    pool.end();
                });
            },
            async updateSnapshotMetadata(
                metadataId: string,
                metadataToUpdate: Partial<SnapshotMetadata>,
            ): Promise<void> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                let propertiesToSet = ``;
                if (metadataToUpdate.id) {
                    propertiesToSet += `"id" = '${metadataToUpdate.id}', `;
                }
                if (metadataToUpdate.status) {
                    propertiesToSet += `"status" = '${metadataToUpdate.status.toString()}', `;
                }
                if (metadataToUpdate.errors) {
                    propertiesToSet += `"errors" = '${metadataToUpdate.errors}', `;
                }
                if (metadataToUpdate.warnings) {
                    propertiesToSet += `"warnings" = '${metadataToUpdate.warnings}', `;
                }
                if (metadataToUpdate.pagesCount) {
                    propertiesToSet += `"pagesCount" = ${metadataToUpdate.pagesCount}, `;
                }
                if (metadataToUpdate.currentPageIndex !== undefined) {
                    propertiesToSet += `"currentPageIndex" = ${metadataToUpdate.currentPageIndex}, `;
                }
                if (metadataToUpdate.totalCount) {
                    propertiesToSet += `"totalCount" = ${metadataToUpdate.totalCount}, `;
                }
                if (metadataToUpdate.dataVersion) {
                    propertiesToSet += `"dataVersion" = ${metadataToUpdate.dataVersion}, `;
                }
                if (metadataToUpdate.irrelevantEntities) {
                    propertiesToSet += `"irrelevantEntities" = '${metadataToUpdate.irrelevantEntities}', `;
                }
                const query = `UPDATE "${process.env.SCHEMA_NAME}"."snapshot_metadata" SET ${propertiesToSet}"lastAccessedTime" = CURRENT_TIMESTAMP WHERE "id" IN ('${metadataId}') `;
                await pool.query(query).then(() => {
                    pool.end();
                });
            },
            async deleteSnapshotPageBySecondsToBeOutdated(
                secondsToBeOutdated: number,
            ): Promise<void> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                const query = `DELETE FROM "${process.env.SCHEMA_NAME}"."snapshot_page" WHERE EXTRACT(EPOCH FROM (NOW() - "lastAccessedTime")) > ${secondsToBeOutdated}`;
                await pool.query(query).then(() => {
                    pool.end();
                });
            },
            async deleteSnapshotMetadataBySecondsToBeOutdated(
                secondsToBeOutdated: number,
            ): Promise<void> {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                const query = `DELETE FROM "${process.env.SCHEMA_NAME}"."snapshot_metadata" WHERE EXTRACT(EPOCH FROM (NOW() - "lastAccessedTime")) > ${secondsToBeOutdated}`;
                await pool.query(query).then(() => {
                    pool.end();
                });
            },
            async startTransaction() {
                const pool = new Pool({
                    connectionString: process.env.CONNECTION_STRING,
                    database: 'postgres',
                    port: 5432,
                });
                const client = await pool.connect();
                await client.query('BEGIN');
                return client;
            },
            async commitTransaction(client?: any) {
                if (client) {
                    await (client as PoolClient).query('COMMIT');
                }
            },
            async rollbackTransaction(client?: any) {
                if (client) {
                    await (client as PoolClient).query('ROLLBACK');
                }
            },
        },
    };
};
