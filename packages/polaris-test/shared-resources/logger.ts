import {LoggerConfiguration, LoggerLevel, PolarisGraphQLLogger} from '@enigmatis/polaris-core';

const loggerConfig: LoggerConfiguration = {
    loggerLevel: LoggerLevel.WARN,
    writeToConsole: true,
    writeFullMessageToConsole: false,
};

const applicationLogProperties = {
    id: 'example',
    name: 'example',
    component: 'repo',
    environment: 'dev',
    version: '1',
};

export const polarisGraphQLLogger = new PolarisGraphQLLogger(
    loggerConfig,
    applicationLogProperties,
);
