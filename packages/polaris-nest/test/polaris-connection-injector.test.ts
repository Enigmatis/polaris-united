import { getConnectionForReality } from '@enigmatis/polaris-core';
import { PolarisTypeORMInjector } from '../src/index';

const connectionMock: any = {
    getRepository: jest.fn(),
};
jest.mock('@enigmatis/polaris-core', () => ({
    getConnectionForReality: jest.fn(() => {
        return connectionMock;
    }),
}));
const reality: any = {
    id: 0,
    name: 'ron',
};
const context: any = {
    reality,
};
const realitiesConfig: any = {
    realitiesMap: [
        [3, { id: 3, type: 'notreal3', name: process.env.SCHEMA_NAME }],
        [0, { id: 0, type: 'realone', name: 'ron' }],
    ],
    getReality: jest.fn().mockReturnValue(reality),
};
const configWithConnectionManager: any = {
    supportedRealities: realitiesConfig,
    connectionManager: {
        connections: [],
        get: jest.fn(),
        create: jest.fn(),
        has: jest.fn().mockReturnValue(true),
    },
};
const configWithoutConnectionManager: any = {
    supportedRealities: realitiesConfig,
};

describe('polaris connection injector tests', () => {
    describe('getConnection tests', () => {
        it('getConnection with valid parameters, getConnectionForReality is called with correct arguments', () => {
            const polarisServerConfigService: any = {
                getPolarisServerConfig: jest.fn().mockReturnValue(configWithConnectionManager),
            };
            const polarisTypeORMInjector = new PolarisTypeORMInjector(
                context,
                polarisServerConfigService,
            );
            polarisTypeORMInjector.getConnection();
            expect(getConnectionForReality).toBeCalledWith(
                context.reality.id,
                configWithConnectionManager.supportedRealities,
                configWithConnectionManager.connectionManager,
            );
        });
        it('getConnection with invalid parameters, throws error', () => {
            const polarisServerConfigService: any = {
                getPolarisServerConfig: jest.fn().mockReturnValue(configWithoutConnectionManager),
            };
            const polarisTypeORMInjector = new PolarisTypeORMInjector(
                context,
                polarisServerConfigService,
            );
            expect(() => polarisTypeORMInjector.getConnection()).toThrowError(
                new Error('No connection manager is defined'),
            );
        });
    });
    describe('getRepository tests', () => {
        it('getRepository, calls polaris connections getRepository', () => {
            const polarisServerConfigService: any = {
                getPolarisServerConfig: jest.fn().mockReturnValue(configWithConnectionManager),
            };
            const polarisTypeORMInjector = new PolarisTypeORMInjector(
                context,
                polarisServerConfigService,
            );
            polarisTypeORMInjector.getRepository('Author');
            expect(connectionMock.getRepository).toBeCalledWith('Author', context);
        });
    });
});
