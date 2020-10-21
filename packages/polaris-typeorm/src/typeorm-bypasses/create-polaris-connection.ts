import {AbstractPolarisLogger} from '@enigmatis/polaris-logs';
import {ConnectionOptions} from 'typeorm';
import {CommonModel, DataVersion, SnapshotMetadata, SnapshotPage} from '..';
import {PolarisTypeormLogger} from '../polaris-typeorm-logger';
import {TypeORMConfig} from '../typeorm-config';
import {PolarisConnection} from './polaris-connection';
import {getPolarisConnectionManager} from './polaris-connection-manager';

export async function createPolarisConnection(
    options: ConnectionOptions,
    logger: AbstractPolarisLogger,
    config?: TypeORMConfig,
): Promise<PolarisConnection> {
    options = setPolarisConnectionOptions(options, logger, config);
    const polarisConnection = await getPolarisConnectionManager()
        .create(options, undefined as any)
        .connect();
    const hasId = await polarisConnection.manager.hasId(DataVersion, 1);
    if (!hasId) {
        await polarisConnection.manager.save(DataVersion, new DataVersion(1));
    }
    return polarisConnection;
}

const setPolarisConnectionOptions = (
    options: ConnectionOptions,
    logger: AbstractPolarisLogger,
    config?: TypeORMConfig,
): ConnectionOptions => {
    Object.assign(options, {
        logger: new PolarisTypeormLogger(logger, options.logging),
    });
    if (config) {
        Object.assign(options, { extra: { ...options.extra, config } });
    }
    const polarisEntities = [CommonModel, DataVersion, SnapshotPage, SnapshotMetadata];
    Object.assign(options, {
        entities: options.entities ? [...options.entities, ...polarisEntities] : polarisEntities,
    });
    return options;
};
