import {
    clearSnapshotCleanerInterval,
    createPolarisConnection,
    getPolarisConnectionManager,
    PolarisServerOptions,
} from '@enigmatis/polaris-nest';
import {bootstrap} from './main';
import * as optionsModule from './polaris-server-options-factory/polaris-server-options-factory-service';
import {TypeOrmOptionsFactoryService} from './type-orm-options-factory/type-orm-options-factory.service';
import {polarisGraphQLLogger} from '../shared-resources/logger';
import {INestApplication} from '@nestjs/common';

export async function startNestTestServer(
    config?: Partial<PolarisServerOptions>,
): Promise<INestApplication> {
    await createPolarisConnection(
        new TypeOrmOptionsFactoryService().createTypeOrmOptions() as any,
        polarisGraphQLLogger as any,
    );
    if (config) {
        setConfiguration(config);
    }
    return bootstrap();
}

export async function stopNestTestServer(app: INestApplication): Promise<void> {
    if (getPolarisConnectionManager().connections.length > 0) {
        const manager = getPolarisConnectionManager();
        for (const connection of manager.connections) {
            if (connection.isConnected) {
                await connection.close();
            }
        }
        Object.assign(manager, { connections: [] });
    }
    await clearSnapshotCleanerInterval();
    await app.close();
}

export function setConfiguration(config: Partial<PolarisServerOptions>) {
    let polarisServerOptions: PolarisServerOptions = optionsModule.createOptions();
    polarisServerOptions = { ...polarisServerOptions, ...config };
    jest.spyOn(optionsModule, 'createOptions').mockImplementation(() => polarisServerOptions);
}
