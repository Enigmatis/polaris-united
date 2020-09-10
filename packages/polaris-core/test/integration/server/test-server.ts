import { RealitiesHolder } from '@enigmatis/polaris-common';
import { ConnectionlessIrrelevantEntitiesCriteria } from '@enigmatis/polaris-middlewares';
import {
    ConnectionOptions,
    DataVersion,
    getPolarisConnectionManager,
    SnapshotMetadata,
    SnapshotPage,
} from '@enigmatis/polaris-typeorm';
import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { ExpressContext, PolarisServer, PolarisServerOptions } from '../../../src';
import * as customContextFields from './constants/custom-context-fields.json';
import { TestClassInContext } from './context/test-class-in-context';
import { TestContext } from './context/test-context';
import { initConnection } from './dal/connection-manager';
import { Author } from './dal/entities/author';
import { Book } from './dal/entities/book';
import * as polarisProperties from './resources/polaris-properties.json';
import { resolvers } from './schema/resolvers';
import { typeDefs } from './schema/type-defs';
import { loggerConfig } from './utils/logger';

export const connectionOptions: ConnectionOptions = {
    type: 'postgres',
    url: process.env.CONNECTION_STRING || '',
    entities: [__dirname + '/dal/entities/*.{ts,js}'],
    synchronize: true,
    dropSchema: true,
    logging: true,
    name: process.env.SCHEMA_NAME,
    schema: process.env.SCHEMA_NAME,
    extra: { max: 10 },
};

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

export async function startTestServer(
    config?: Partial<PolarisServerOptions>,
): Promise<PolarisServer> {
    await initConnection(connectionOptions);
    const options = { ...getDefaultTestServerConfig(), ...config };
    const server = new PolarisServer(options);
    await server.start();
    return server;
}

export async function stopTestServer(server: PolarisServer): Promise<void> {
    await server.stop();
    const connectionManager = getPolarisConnectionManager();
    if (connectionManager.connections.length > 0) {
        for (const connection of connectionManager.connections) {
            await connectionManager.get(connection.name).close();
        }
    }
}

const getDefaultTestServerConfig = (): PolarisServerOptions => {
    return {
        typeDefs,
        resolvers,
        customContext,
        port: polarisProperties.port,
        logger: loggerConfig,
        supportedRealities: new RealitiesHolder(
            new Map([
                [3, { id: 3, type: 'notreal3', name: process.env.SCHEMA_NAME }],
                [0, { id: 0, type: 'realone', name: process.env.SCHEMA_NAME }],
            ]),
        ),
        connectionManager: getPolarisConnectionManager(),
        connectionLessConfiguration: {
            getDataVersion(): Promise<DataVersion> {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
                    database: 'postgres',
                    port: 5432,
                });
                const query =
                    'SELECT "DataVersion"."id" AS "id", "DataVersion"."value" AS "value" \n' +
                    `FROM "${process.env.SCHEMA_NAME}"."data_version" "DataVersion" LIMIT 1`;
                return pool.query(query).then(res => {
                    const dataVersion = new DataVersion(res.rows[0].value);
                    pool.end();
                    return dataVersion;
                });
            },
            getIrrelevantEntities(
                typeName: string,
                criteria: ConnectionlessIrrelevantEntitiesCriteria,
            ): Promise<any[]> {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
                    database: 'postgres',
                    port: 5432,
                });
                let query =
                    `SELECT * FROM "${process.env.SCHEMA_NAME}"."book" "${typeName}" \n` +
                    `WHERE "${typeName}"."realityId" = ${criteria.realityId} \n` +
                    `AND "${typeName}"."dataVersion" > ${criteria.dataVersionThreshold} \n`;
                if (criteria.notInIds?.length > 0) {
                    query += `AND NOT("${typeName}"."id" IN ('${criteria.notInIds?.join(',')}'))`;
                }
                return pool.query(query).then(res => {
                    const irrelevantEntities: any[] = [];
                    if (typeName === 'Book') {
                        res.rows.forEach(value => {
                            const book = new Book(
                                value.title,
                                new Author('first', 'last'),
                                value.id,
                            );
                            irrelevantEntities.push(book);
                        });
                    } else {
                        res.rows.forEach(value => {
                            irrelevantEntities.push(new Author(value.firstName, value.lastName));
                        });
                    }
                    pool.end();
                    return irrelevantEntities;
                });
            },
            saveSnapshotPages(pages: SnapshotPage[]): void {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
                    database: 'postgres',
                    port: 5432,
                });
                const valuesToInsert: string[] = [];
                pages.forEach(page => {
                    valuesToInsert.push(
                        `('${page.id}', DEFAULT, DEFAULT, '${page.status.toString()}')`,
                    );
                });
                const query =
                    `INSERT INTO "${process.env.SCHEMA_NAME}"."snapshot_page"("id", "data", "lastAccessedTime", "status") \n` +
                    `VALUES ${valuesToInsert.join(',')} RETURNING "id", "lastAccessedTime"`;
                pool.query(query).then(() => {
                    pool.end();
                });
            },
            saveSnapshotMetadata(metadata: SnapshotMetadata): Promise<SnapshotMetadata> {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
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
                }, ${
                    metadata.currentPageIndex
                }, '${metadata.status.toString()}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT) RETURNING "id", "lastAccessedTime", "creationTime" `;
                return pool.query(query).then(res => {
                    pool.end();
                    const snapshotMetadataToReturn = new SnapshotMetadata();
                    Object.assign(snapshotMetadataToReturn, { id: uuidOfSnapshotMetadata });
                    return snapshotMetadataToReturn;
                });
            },
            getSnapshotPageById(id: string): Promise<SnapshotPage> {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
                    database: 'postgres',
                    port: 5432,
                });
                const query = `SELECT "SnapshotPage"."id", "SnapshotPage"."data", "SnapshotPage"."creationTime"
                               FROM "${process.env.SCHEMA_NAME}"."snapshot_page" "SnapshotPage" WHERE "SnapshotPage"."id" IN ("${id}") LIMIT 1`;
                return pool.query(query).then(res => {
                    pool.end();
                    const snapshotPage = new SnapshotPage(res.rows[0].id);
                    Object.assign(snapshotPage, res.rows[0]);
                    return snapshotPage;
                });
            },
            getSnapshotMetadataById(id: string): Promise<SnapshotMetadata> {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
                    database: 'postgres',
                    port: 5432,
                });
                const query = `SELECT "SnapshotMetadata"."id", "SnapshotMetadata"."lastAccessedTime", "SnapshotMetadata"."pagesIds", "SnapshotMetadata"."pagesCount", "SnapshotMetadata"."currentPageIndex", "SnapshotMetadata"."status", "SnapshotMetadata"."irrelevantEntities", "SnapshotMetadata"."dataVersion", "SnapshotMetadata"."totalCount", "SnapshotMetadata"."warnings", "SnapshotMetadata"."errors", "SnapshotMetadata"."creationTime"
                               FROM "${process.env.SCHEMA_NAME}"."snapshot_metadata" "SnapshotMetadata" WHERE "SnapshotMetadata"."id" IN ('${id}') LIMIT 1`;
                return pool.query(query).then(res => {
                    pool.end();
                    const snapshotMetadata = new SnapshotMetadata();
                    Object.assign(snapshotMetadata, res.rows[0]);
                    return snapshotMetadata;
                });
            },
            updateSnapshotPage(pageId: string, pageToUpdate: Partial<SnapshotPage>): void {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
                    database: 'postgres',
                    port: 5432,
                });
                const query = `UPDATE "${
                    process.env.SCHEMA_NAME
                }"."snapshot_page" SET "status" = '${
                    pageToUpdate.status
                }', "data" = decode('${pageToUpdate.data?.toString()}','escape'), "lastAccessedTime" = CURRENT_TIMESTAMP WHERE "id" IN ('${pageId}') `;
                pool.query(query).then(() => {
                    pool.end();
                });
                // const query = `INSERT INTO "${
                //     process.env.SCHEMA_NAME
                // }"."snapshot_page"("id", "data", "creationTime") VALUES (DEFAULT, decode('${page.getData()}','escape'), DEFAULT) RETURNING "id", "creationTime"`;
            },
            updateSnapshotMetadata(
                metadataId: string,
                metadataToUpdate: Partial<SnapshotMetadata>,
            ): void {
                // const pool = new Pool({
                //     connectionString:
                //         'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
                //     database: 'postgres',
                //     port: 5432,
                // });
                // pool.query(query).then(() => {
                //     pool.end();
                // });
                const s = 5;
            },
            deleteSnapshotPageBySecondsToBeOutdated(secondsToBeOutdated: number): void {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
                    database: 'postgres',
                    port: 5432,
                });
                const query = `DELETE FROM "${process.env.SCHEMA_NAME}"."snapshot_page" WHERE EXTRACT(EPOCH FROM (NOW() - "lastAccessedTime")) > ${secondsToBeOutdated}`;
                pool.query(query).then(() => {
                    pool.end();
                });
            },
            deleteSnapshotMetadataBySecondsToBeOutdated(secondsToBeOutdated: number): void {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
                    database: 'postgres',
                    port: 5432,
                });
                const query = `DELETE FROM "${process.env.SCHEMA_NAME}"."snapshot_metadata" WHERE EXTRACT(EPOCH FROM (NOW() - "lastAccessedTime")) > ${secondsToBeOutdated}`;
                pool.query(query).then(() => {
                    pool.end();
                });
            },
            async startTransaction() {
                const pool = new Pool({
                    connectionString:
                        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
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
