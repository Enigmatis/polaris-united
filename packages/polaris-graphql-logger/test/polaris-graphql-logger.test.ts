import { GraphQLLogProperties, PolarisGraphQLLogger } from '../src/main';
import { PolarisLogProperties } from '@enigmatis/polaris-logs';
import { getContextWithRequestHeaders } from './context-util';

const requestId = '0';
const upn = 'upn';
const requestingSystemId = 'requestingSystemId';
const requestingSystemName = 'requestingSystemName';
const realityId = 0;
const requestingIp = 'requestingIp';

const polarisGQLLogger = new PolarisGraphQLLogger(jest.fn() as any, jest.fn() as any);
const polarisLogger = { info: jest.fn() } as any;
Object.assign(polarisGQLLogger.polarisLogger, polarisLogger);
describe('build log properties tests', () => {
    test('info, context empty and log properties exist, only log properties returned', () => {
        const polarisLogProperties = { reality: { id: 0, type: 'operational' } };
        polarisGQLLogger.info('context is empty', { polarisLogProperties });
        expect(polarisLogger.info).toBeCalledWith('context is empty', polarisLogProperties);
    });

    test('info, context exist and log properties does not, only context returned', () => {
        const context = getContextWithRequestHeaders(
            {
                upn,
                requestId,
                realityId,
                requestingSystemId,
                requestingSystemName,
            },
            requestingIp,
        );
        polarisGQLLogger.info('context is full', { context });
        expect(polarisLogger.info).toBeCalledWith('context is full', {
            requestId,
            eventKind: undefined,
            eventKindDescription: { requestingSystemId },
            reality: { id: realityId },
            request: {
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
                requestId,
                realityId,
                requestingSystemId,
                requestingSystemName,
            },
            requestingIp,
        );
        const eventKind = '123';
        const polarisLogProperties: PolarisLogProperties = { eventKind };
        polarisGQLLogger.info('context is full', { context, polarisLogProperties });
        expect(polarisLogger.info).toBeCalledWith('context is full', {
            requestId,
            eventKind,
            eventKindDescription: { requestingSystemId },
            reality: { id: realityId },
            request: {
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
                requestId,
                realityId,
                requestingSystemId,
                requestingSystemName,
            },
            requestingIp,
        );
        const eventKind = '123';
        const operationName = 'operationName';
        const polarisLogProperties: GraphQLLogProperties = { eventKind, operationName };
        polarisGQLLogger.info('context is full', { context, polarisLogProperties });
        expect(polarisLogger.info).toBeCalledWith('context is full', {
            requestId,
            eventKind,
            eventKindDescription: { requestingSystemId },
            reality: { id: realityId },
            request: {
                requestingUserIdentifier: upn,
                requestingIp,
                requestingSystem: { id: requestingSystemId, name: requestingSystemName },
            },
            operationName,
        });
    });
});
