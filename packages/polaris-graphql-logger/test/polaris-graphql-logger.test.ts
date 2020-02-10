import { GraphQLLogProperties, PolarisGraphQLLogger } from '../src/main';
import {
    ApplicationProperties,
    LoggerConfiguration,
    PolarisLogProperties,
} from '@enigmatis/polaris-logs';
import { getContextWithRequestHeaders, requestQuery } from './context-util';

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

const polarisGQLLogger: any = new PolarisGraphQLLogger(config, {});
Object.assign(polarisGQLLogger.logger, loggerImplMock);

describe('build log properties tests', () => {
    test('info, context empty and log properties exist, only log properties returned', () => {
        polarisGQLLogger.info(
            'context is empty',
            PolarisGraphQLLogger.buildLogProperties(undefined, {
                reality: { id: 0, type: 'operational' },
            }),
        );
        expect(loggerImplMock.info).toBeCalledWith({
            message: 'context is empty',
            messageId: expect.anything(),
            reality: { id: 0, type: 'operational' },
        });
    });

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
        const x = PolarisGraphQLLogger.buildLogProperties(context);
        const message = 'context is full';
        polarisGQLLogger.info(message, x);
        expect(loggerImplMock.info).toBeCalledWith({
            message,
            messageId,
            eventKindDescription: { requestingSystemId },
            reality: { id: realityId },
            request: {
                requestQuery,
                requestingUserIdentifier: upn,
                requestingIp,
                requestingSystem: { id: requestingSystemId, name: requestingSystemName },
            },
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
        polarisGQLLogger.info(
            message,
            PolarisGraphQLLogger.buildLogProperties(context, polarisLogProperties),
        );
        expect(loggerImplMock.info).toBeCalledWith({
            message,
            messageId,
            eventKind,
            eventKindDescription: { requestingSystemId },
            reality: { id: realityId },
            request: {
                requestQuery,
                requestingUserIdentifier: upn,
                requestingIp,
                requestingSystem: { id: requestingSystemId, name: requestingSystemName },
            },
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
        const operationName = 'operationName';
        const polarisLogProperties: GraphQLLogProperties = { eventKind, operationName };
        polarisGQLLogger.info(
            message,
            PolarisGraphQLLogger.buildLogProperties(context, polarisLogProperties),
        );
        expect(loggerImplMock.info).toBeCalledWith({
            message,
            messageId,
            eventKind,
            eventKindDescription: { requestingSystemId },
            reality: { id: realityId },
            request: {
                requestQuery,
                requestingUserIdentifier: upn,
                requestingIp,
                requestingSystem: { id: requestingSystemId, name: requestingSystemName },
            },
            operationName,
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
        const operationName = 'operationName';
        const polarisLogProperties: GraphQLLogProperties = { eventKind, operationName };
        polarisGQLLoggerWithAppProperties.info(
            message,
            PolarisGraphQLLogger.buildLogProperties(context, polarisLogProperties),
        );
        expect(loggerImplMock.info).toBeCalledWith({
            message,
            component: appProps.component,
            environment: appProps.environment,
            messageId,
            eventKind,
            eventKindDescription: { requestingSystemId, systemId: appProps.id },
            reality: { id: realityId },
            request: {
                requestQuery,
                requestingUserIdentifier: upn,
                requestingIp,
                requestingSystem: { id: requestingSystemId, name: requestingSystemName },
            },
            operationName,
            version: appProps.version,
            systemName: appProps.name,
            systemId: appProps.id,
        });
    });
});
