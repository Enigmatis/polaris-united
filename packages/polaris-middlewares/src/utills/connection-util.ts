import {
    getConnectionForReality,
    PolarisConnection,
    PolarisConnectionManager,
} from '@enigmatis/polaris-typeorm';
import { RealitiesHolder } from '@enigmatis/polaris-common';
import { ConnectionlessConfiguration } from '..';

export const getConnectionByConnectionlessConfiguration = (
    realityId: number,
    realitiesHolder: RealitiesHolder,
    connectionManager?: PolarisConnectionManager,
    connectionlessConfiguration?: ConnectionlessConfiguration,
): PolarisConnection | undefined => {
    return connectionlessConfiguration
        ? undefined
        : getConnectionForReality(
              realityId,
              realitiesHolder as any,
              connectionManager as PolarisConnectionManager,
          );
};
