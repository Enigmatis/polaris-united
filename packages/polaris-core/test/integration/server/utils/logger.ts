import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { LoggerConfiguration, LoggerLevel } from '@enigmatis/polaris-logs';

export const loggerConfig: LoggerConfiguration = {
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
    {
        loggerLevel: LoggerLevel.WARN,
        writeToConsole: true,
        writeFullMessageToConsole: false,
    },
    applicationLogProperties,
);
