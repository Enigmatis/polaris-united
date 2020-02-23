import { GraphQLLogProperties, PolarisGraphQLLogger } from '../src/main';
import {
    ApplicationProperties,
    LoggerConfiguration,
    PolarisLogProperties,
} from '@enigmatis/polaris-logs';
import {
    getContextWithRequestHeaders,
    operationName,
    query,
    response,
    variables,
} from './context-util';

const messageId = '0';
const upn = 'upn';
const requestingSystemId = 'requestingSystemId';
const requestingSystemName = 'requestingSystemName';
const realityId = 0;
const requestingIp = 'requestingIp';

const config: LoggerConfiguration = {
    loggerLevel: 'info',
};
const loggerImplMock: any = {
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
} as any;

const polarisGQLLogger: any = new PolarisGraphQLLogger(config);
Object.assign(polarisGQLLogger.logger, loggerImplMock);

describe('build log properties tests', () => {
    test('info, context exist and log properties does not, only context returned', () => {
        const context = getContextWithRequestHeaders(
            {
                upn,
                requestId: messageId,
                realityId,
                requestingSystemId,
                requestingSystemName,
            },
            requestingIp,
        );
        const message = 'context is full';
        polarisGQLLogger.info(message, context);
        expect(loggerImplMock.info).toBeCalledWith({
            message,
            messageId,
            eventKindDescription: { requestingSystemId },
            reality: { id: realityId },
            request: {
                requestQuery: {
                    query,
                    operationName,
                    variables,
                },
                requestingUserIdentifier: upn,
                requestingIp,
                requestingSystem: { id: requestingSystemId, name: requestingSystemName },
            },
            response,
        });
    });

    test('info, context exist and log properties exist, builds log correctly', () => {
        const context = getContextWithRequestHeaders(
            {
                upn,
                requestId: messageId,
                realityId,
                requestingSystemId,
                requestingSystemName,
            },
            requestingIp,
        );
        const message = 'context is full';
        const eventKind = '123';
        const polarisLogProperties: PolarisLogProperties = { eventKind };
        polarisGQLLogger.info(message, context, polarisLogProperties);
        expect(loggerImplMock.info).toBeCalledWith({
            message,
            messageId,
            eventKind,
            eventKindDescription: { requestingSystemId },
            reality: { id: realityId },
            request: {
                requestQuery: { query, operationName, variables },
                requestingUserIdentifier: upn,
                requestingIp,
                requestingSystem: { id: requestingSystemId, name: requestingSystemName },
            },
            response,
        });
    });

    test('info, graphql log properties exist, adds operationName to log', () => {
        const context = getContextWithRequestHeaders(
            {
                upn,
                requestId: messageId,
                realityId,
                requestingSystemId,
                requestingSystemName,
            },
            requestingIp,
        );
        const message = 'context is full';
        const eventKind = '123';
        const polarisLogProperties: GraphQLLogProperties = { eventKind };
        polarisGQLLogger.info(message, context, polarisLogProperties);
        expect(loggerImplMock.info).toBeCalledWith({
            message,
            messageId,
            eventKind,
            eventKindDescription: { requestingSystemId },
            reality: { id: realityId },
            request: {
                requestQuery: { query, operationName, variables },
                requestingUserIdentifier: upn,
                requestingIp,
                requestingSystem: { id: requestingSystemId, name: requestingSystemName },
            },
            response,
        });
    });
    test('info, graphql log properties exist, with application properties', () => {
        const appProps: ApplicationProperties = {
            id: 'p0laris-l0gs',
            name: 'polaris-logs',
            version: 'v1',
            environment: 'environment',
            component: 'component',
        };
        const polarisGQLLoggerWithAppProperties: any = new PolarisGraphQLLogger(config, appProps);
        Object.assign(polarisGQLLoggerWithAppProperties.logger, loggerImplMock);
        const context = getContextWithRequestHeaders(
            {
                upn,
                requestId: messageId,
                realityId,
                requestingSystemId,
                requestingSystemName,
            },
            requestingIp,
        );
        const message = 'context is full';
        const eventKind = '123';
        const polarisLogProperties: GraphQLLogProperties = { eventKind };
        polarisGQLLoggerWithAppProperties.info(message, context, polarisLogProperties);
        expect(loggerImplMock.info).toBeCalledWith({
            message,
            component: appProps.component,
            environment: appProps.environment,
            messageId,
            eventKind,
            eventKindDescription: { requestingSystemId, systemId: appProps.id },
            reality: { id: realityId },
            request: {
                requestQuery: { query, operationName, variables },
                requestingUserIdentifier: upn,
                requestingIp,
                requestingSystem: { id: requestingSystemId, name: requestingSystemName },
            },
            version: appProps.version,
            systemName: appProps.name,
            systemId: appProps.id,
            response,
        });
    });
});
