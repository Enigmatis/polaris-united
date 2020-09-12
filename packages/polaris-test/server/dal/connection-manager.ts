import { ConnectionOptions, createPolarisConnection } from '@enigmatis/polaris-core';
import { polarisGraphQLLogger } from '../../test-utils/logger';

export async function initConnection(connectionOptions: ConnectionOptions) {
    await createPolarisConnection(connectionOptions, polarisGraphQLLogger as any);
}
