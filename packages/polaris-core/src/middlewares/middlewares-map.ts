import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    DataVersionMiddleware,
    IrrelevantEntitiesMiddleware,
    RealitiesMiddleware,
    SoftDeleteMiddleware,
    DatesFilterMiddleware,
} from '@enigmatis/polaris-middlewares';
import { PolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import { PolarisServerConfig } from '..';

export const getMiddlewaresMap = (
    config: PolarisServerConfig,
    logger: PolarisGraphQLLogger,
    connectionManager?: PolarisConnectionManager,
): Map<string, any[]> => {
    const softDeleteMiddleware = new SoftDeleteMiddleware(logger).getMiddleware();
    const realitiesMiddleware = new RealitiesMiddleware(
        logger,
        config.supportedRealities,
    ).getMiddleware();
    const dataVersionMiddleware = new DataVersionMiddleware(
        config.enableDataVersionFilter,
        logger,
        config.supportedRealities,
        connectionManager,
        config.connectionlessConfiguration,
    ).getMiddleware();
    const irrelevantEntitiesMiddleware = new IrrelevantEntitiesMiddleware(
        logger,
        config.supportedRealities,
        connectionManager,
        config.connectionlessConfiguration,
    ).getMiddleware();
    const datesFilterMiddleware = new DatesFilterMiddleware(
        logger,
        config.supportedRealities,
        connectionManager,
    ).getMiddleware();

    return new Map([
        ['allowSoftDeleteMiddleware', [softDeleteMiddleware]],
        ['allowRealityMiddleware', [realitiesMiddleware]],
        [
            'allowDataVersionAndIrrelevantEntitiesMiddleware',
            [dataVersionMiddleware, irrelevantEntitiesMiddleware],
        ],
        ['allowDatesFilterMiddleware', [datesFilterMiddleware]],
    ]);
};
