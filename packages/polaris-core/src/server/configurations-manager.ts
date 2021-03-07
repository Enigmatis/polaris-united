import {
    NotificationCenterConfig,
    ApplicationProperties,
    RealitiesHolder,
} from '@enigmatis/polaris-common';
import { LoggerConfiguration, LoggerLevel } from '@enigmatis/polaris-logs';
import {
    createPolarisLoggerFromPolarisServerOptions,
    MiddlewareConfiguration,
    PolarisServerConfig,
    SnapshotConfiguration,
    PermissionsConfiguration,
    PolarisCoreOptions,
} from '..';
import { PolarisSchemaConfig } from '@enigmatis/polaris-schema';

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
    entitiesAmountPerFetch: 50,
    autoSnapshot: false,
});

const getSupportedRealities = (options: PolarisCoreOptions): RealitiesHolder => {
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

const getDefaultPermissionsConfiguration = (): PermissionsConfiguration => ({
    enablePermissions: true,
});

const getDefaultNotificationCenterConfig = (
    config?: NotificationCenterConfig,
): NotificationCenterConfig | undefined => {
    return config
        ? {
              ...config,
              topicsAmountOfPartition: config.topicsAmountOfPartition || 3,
              partitionerSelector: config.partitionerSelector || undefined,
              topicPrefix: config.topicPrefix || 'repo',
              topicsReplicationFactor: config.topicsReplicationFactor || 1,
          }
        : undefined;
};

const getDefaultPolarisSchemaConfig = (): PolarisSchemaConfig => {
    return {
        addPolarisGraphQLScalars: true,
        polarisTypeDefs: {
            addOnlinePagingTypeDefs: true,
            addFiltersTypeDefs: true,
        },
    };
};

export const getPolarisServerConfigFromOptions = (
    options: PolarisCoreOptions,
): PolarisServerConfig => {
    const applicationProperties = getDefaultApplicationProperties(options.applicationProperties);
    return {
        ...options,
        typeDefs: options.typeDefs || [],
        resolvers: options.resolvers || [],
        maxPageSize: options.maxPageSize || 50,
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
        permissionsConfig: options.permissionsConfig || getDefaultPermissionsConfiguration(),
        enableDataVersionFilter:
            options.enableDataVersionFilter === undefined ? true : options.enableDataVersionFilter,
        notificationCenterConfig: getDefaultNotificationCenterConfig(
            options.notificationCenterConfig,
        ),
        polarisSchemaConfig: options.polarisSchemaConfig || getDefaultPolarisSchemaConfig(),
    };
};
