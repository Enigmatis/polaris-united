import { ConnectionOptions } from '@enigmatis/polaris-core';

export const connectionOptions: ConnectionOptions = {
    name: process.env.SCHEMA_NAME,
    type: 'postgres',
    entities: [__dirname + '/entities/*.{ts,js}'],
    url: process.env.CONNECTION_STRING || '',
    synchronize: true,
    dropSchema: true,
    logging: true,
    schema: process.env.SCHEMA_NAME,
    extra: { max: 10 },
};

export const connectionOptionsRon: ConnectionOptions = {
    name: 'ron',
    type: 'postgres',
    entities: [__dirname + '/entities/*.{ts,js}'],
    url: process.env.CONNECTION_STRING || '',
    synchronize: true,
    dropSchema: true,
    logging: true,
    schema: 'ron',
    extra: { max: 10 },
};
