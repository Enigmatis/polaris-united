import { RealitiesHolder } from '@enigmatis/polaris-common';
import { ConnectionOptions, getPolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import { ExpressContext, PolarisServer, PolarisServerOptions } from '../../../src';
import * as customContextFields from './constants/custom-context-fields.json';
import { TestClassInContext } from './context/test-class-in-context';
import { TestContext } from './context/test-context';
import { initConnection } from './dal/connection-manager';
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
        // connectionLessConfiguration: {
        //     getDataVersion(): Promise<DataVersion> {
        //         const pool = new Pool({
        //             connectionString:
        //                 'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
        //             database: 'postgres',
        //             port: 5432,
        //         });
        //         const query =
        //             'SELECT "DataVersion"."id" AS "id", "DataVersion"."value" AS "value" \n' +
        //             `FROM "${process.env.SCHEMA_NAME}"."data_version" "DataVersion" LIMIT 1`;
        //         return pool.query(query).then(res => {
        //             const dataVersion = new DataVersion(res.rows[0].value);
        //             pool.end();
        //             return dataVersion;
        //         });
        //     },
        //     getIrrelevantEntities(
        //         typeName: string,
        //         criteria: ConnectionlessIrrelevantEntitiesCriteria,
        //     ): Promise<any[]> {
        //         const pool = new Pool({
        //             connectionString:
        //                 'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
        //             database: 'postgres',
        //             port: 5432,
        //         });
        //         const query =
        //             `SELECT * FROM "${process.env.SCHEMA_NAME}"."book" "${typeName}" \n` +
        //             `WHERE NOT("${typeName}"."id" IN ('${criteria.notInIds?.join(',')}')) \n` +
        //             `AND "${typeName}"."realityId" = ${criteria.realityId}`;
        //         return pool.query(query).then(res => {
        //             const irrelevantEntities: any[] = [];
        //             if (typeName === 'Book') {
        //                 res.rows.forEach(value => {
        //                     const book = new Book(
        //                         value.title,
        //                         new Author('first', 'last'),
        //                         value.id,
        //                     );
        //                     irrelevantEntities.push(book);
        //                 });
        //             } else {
        //                 res.rows.forEach(value => {
        //                     irrelevantEntities.push(new Author(value.firstName, value.lastName));
        //                 });
        //             }
        //             pool.end();
        //             return irrelevantEntities;
        //         });
        //     },
        //     saveSnapshotPage(page: SnapshotPage): void {
        //         const pool = new Pool({
        //             connectionString:
        //                 'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
        //             database: 'postgres',
        //             port: 5432,
        //         });
        //         const query = `INSERT INTO "${
        //             process.env.SCHEMA_NAME
        //         }"."snapshot_page"("id", "data", "creationTime") VALUES (DEFAULT, decode('${page.getData()}','escape'), DEFAULT) RETURNING "id", "creationTime"`;
        //         pool.query(query).then(() => {
        //             pool.end();
        //         });
        //     },
        //     getSnapshotPageById(id: string): Promise<SnapshotPage> {
        //         const pool = new Pool({
        //             connectionString:
        //                 'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
        //             database: 'postgres',
        //             port: 5432,
        //         });
        //         const query = `SELECT "SnapshotPage"."id" AS "SnapshotPage_id", "SnapshotPage"."data" AS "SnapshotPage_data", "SnapshotPage"."creationTime" AS "SnapshotPage_creationTime"
        //                        FROM "${process.env.SCHEMA_NAME}"."snapshot_page" "SnapshotPage" WHERE "SnapshotPage"."id" IN ("${id}") LIMIT 1`;
        //         return pool.query(query).then(res => {
        //             const snapshotPage = new SnapshotPage('');
        //             pool.end();
        //             return snapshotPage;
        //         });
        //     },
        //     deleteSnapshotPageBySecondsToBeOutdated(secondsToBeOutdated: number): void {
        //         const pool = new Pool({
        //             connectionString:
        //                 'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
        //             database: 'postgres',
        //             port: 5432,
        //         });
        //         const query = `DELETE FROM ${tablePath} WHERE EXTRACT(EPOCH FROM (NOW() - "creationTime")) > ${secondsToBeOutdated};`;
        //         pool.query(query).then(() => {
        //             pool.end();
        //         });
        //     },
        // },
    };
};
