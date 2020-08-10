import { ApplicationProperties, LoggerConfiguration } from '@enigmatis/polaris-logs';
import * as path from 'path';
import { ConnectionOptions } from 'typeorm';

export const connectionOptions: ConnectionOptions = {
    type: 'postgres',
    url: process.env.CONNECTION_STRING || '',
    entities: [path.resolve(__dirname, '../..') + '/dal/*.ts'],
    synchronize: true,
    dropSchema: true,
    logging: true,
    name: process.env.SCHEMA_NAME,
    schema: process.env.SCHEMA_NAME,
};

export const applicationLogProperties: ApplicationProperties = {
    id: 'example',
    name: 'example',
    component: 'repo',
    environment: 'dev',
    version: '1',
};

export const loggerConfig: LoggerConfiguration = {
    loggerLevel: 'debug',
    writeToConsole: true,
    writeFullMessageToConsole: false,
};
