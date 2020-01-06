import { PolarisLogger } from '@enigmatis/polaris-logs';
import * as path from 'path';
import { ConnectionOptions, createConnection } from 'typeorm';
import { CommonModel, DataVersion } from '..';
import { PolarisEntityManager } from '../polaris-entity-manager';
import { PolarisTypeormLogger } from '../polaris-typeorm-logger';
import { TypeORMConfig } from '../typeorm-config';

export async function createPolarisConnection(
    options: ConnectionOptions,
    logger: PolarisLogger,
    config?: TypeORMConfig,
) {
    Object.assign(options, { logger: new PolarisTypeormLogger(logger, options.logging) });
    const configObj = { config: config || {} };
    options.extra
        ? Object.assign(options.extra, configObj)
        : Object.assign(options, { extra: configObj });
    Object.assign(options, {
        subscribers: [
            path.resolve(__dirname, '../') + '/subscribers/*.ts',
            path.resolve(__dirname, '../') + '/subscribers/*.js',
            options.subscribers,
        ],
    });
    options.entities
        ? Object.assign(options.entities, [...options.entities, CommonModel, DataVersion])
        : Object.assign(options, { entities: [CommonModel, DataVersion] });
    const connection = await createConnection(options);
    Object.defineProperty(connection, 'manager', { value: new PolarisEntityManager(connection) });
    return connection;
}
