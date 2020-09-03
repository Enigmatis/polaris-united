import { ApplicationProperties, LoggerConfiguration, LoggerLevel } from '@enigmatis/polaris-logs';
import * as path from 'path';
import { ConnectionOptions } from 'typeorm';

export const connectionOptions: ConnectionOptions = {
    type: 'postgres',
    url:
        process.env.CONNECTION_STRING ||
        'postgres://vulcan_usr@galileo-dbs:vulcan_usr123@galileo-dbs.postgres.database.azure.com:5432/vulcan_db',
    entities: [path.resolve(__dirname, '../..') + '/dal/*.ts'],
    synchronize: true,
    dropSchema: true,
    logging: true,
    name: process.env.SCHEMA_NAME || 'chen',
    schema: process.env.SCHEMA_NAME || 'chen',
};

export const applicationLogProperties: ApplicationProperties = {
    id: 'example',
    name: 'example',
    component: 'repo',
    environment: 'dev',
    version: '1',
};

export const loggerConfig: LoggerConfiguration = {
    loggerLevel: LoggerLevel.INFO,
    writeToConsole: true,
    writeFullMessageToConsole: false,
};
