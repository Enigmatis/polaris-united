import { LoggerConfiguration, LoggerLevel, PolarisGraphQLLogger } from '@enigmatis/polaris-core';

export const loggerConfig: LoggerConfiguration = {
    loggerLevel: LoggerLevel.INFO,
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
    {
        loggerLevel: LoggerLevel.DEBUG,
        writeToConsole: true,
        writeFullMessageToConsole: false,
    },
    applicationLogProperties,
);
