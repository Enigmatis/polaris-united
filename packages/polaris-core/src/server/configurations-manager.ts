import { ApplicationProperties, RealitiesHolder } from '@enigmatis/polaris-common';
import { LoggerConfiguration, LoggerLevel } from '@enigmatis/polaris-logs';
import {
    createPolarisLoggerFromPolarisServerOptions,
    MiddlewareConfiguration,
    PolarisServerConfig,
    PolarisServerOptions,
    SnapshotConfiguration,
} from '..';
import { PagingConfiguration } from '../config/paging-configuration';

const getDefaultMiddlewareConfiguration = (): MiddlewareConfiguration => ({
    allowDataVersionAndIrrelevantEntitiesMiddleware: true,
    allowRealityMiddleware: true,
    allowSoftDeleteMiddleware: true,
    allowTransactionalMutations: true,
    allowDatesFilterMiddleware: true,
});

const getDefaultLoggerConfiguration = (): LoggerConfiguration => ({
    loggerLevel: LoggerLevel.INFO,
    writeToConsole: true,
    writeFullMessageToConsole: false,
});

const getDefaultSnapshotConfiguration = (): SnapshotConfiguration => ({
    snapshotCleaningInterval: 60,
    secondsToBeOutdated: 60,
    maxPageSize: getDefaultPagingConfiguration().maxPageSize,
    entitiesAmountPerFetch: 50,
    autoSnapshot: false,
});

const getDefaultPagingConfiguration = (): PagingConfiguration => ({
    maxPageSize: 50,
});

const getSupportedRealities = (options: PolarisServerOptions): RealitiesHolder => {
    if (!options.supportedRealities) {
        options.supportedRealities = new RealitiesHolder();
    }

    if (!options.supportedRealities.hasReality(0)) {
        options.supportedRealities.addReality({
            id: 0,
            type: 'real',
            name: 'default',
        });
    }

    return options.supportedRealities;
};

const getDefaultApplicationProperties = (
    properties?: ApplicationProperties,
): ApplicationProperties => {
    const defaultVersion = { version: 'v1' };
    if (!properties) {
        return defaultVersion;
    } else if (!properties.version) {
        return { ...properties, ...defaultVersion };
    } else {
        return properties;
    }
};

export const getPolarisServerConfigFromOptions = (
    options: PolarisServerOptions,
): PolarisServerConfig => {
    const applicationProperties = getDefaultApplicationProperties(options.applicationProperties);
    return {
        ...options,
        middlewareConfiguration:
            options.middlewareConfiguration || getDefaultMiddlewareConfiguration(),
        logger: createPolarisLoggerFromPolarisServerOptions(
            options.logger || getDefaultLoggerConfiguration(),
            applicationProperties,
        ),
        applicationProperties,
        allowSubscription: options.allowSubscription || false,
        enableFederation: options.enableFederation || false,
        shouldAddWarningsToExtensions:
            options.shouldAddWarningsToExtensions === undefined
                ? true
                : options.shouldAddWarningsToExtensions,
        allowMandatoryHeaders: options.allowMandatoryHeaders || false,
        supportedRealities: getSupportedRealities(options),
        snapshotConfig: options.snapshotConfig || getDefaultSnapshotConfiguration(),
        pagingConfig: options.pagingConfig || getDefaultPagingConfiguration(),
        permissionsConfig: options.permissionsConfig || {},
        enableDataVersionFilter:
            options.enableDataVersionFilter === undefined ? true : options.enableDataVersionFilter,
    };
};
