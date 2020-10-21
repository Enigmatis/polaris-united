import { ConnectionOptions } from 'typeorm';
import { createPolarisConnection, PolarisConnection } from '../../../src';
import { PolarisTypeormLogger } from '../../../src/polaris-typeorm-logger';

const polarisGraphQLLogger = { debug: jest.fn() } as any;

const connectionManager = require('../../../src/typeorm-bypasses/polaris-connection-manager');
let hasId = jest.fn(() => true);
connectionManager.getPolarisConnectionManager = jest.fn(() => {
    return {
        create: (options: ConnectionOptions) => {
            return {
                connect: () => {
                    return { options, manager: { hasId, save: jest.fn() } };
                },
            };
        },
    };
});

describe('create polaris connection tests', () => {
    it(
        'create connection, send logger and options, expect polaris typeorm logger to be' +
            ' created and defined with the right options',
        async () => {
            const connection: PolarisConnection = await createPolarisConnection(
                { logging: true } as any,
                polarisGraphQLLogger,
            );
            expect(connection.options.logger).toBeDefined();
            expect(connection.options.logger).toBeInstanceOf(PolarisTypeormLogger);
            // @ts-ignore
            expect((connection.options.logger as PolarisTypeormLogger)?.options).toBeTruthy();
            // @ts-ignore
            expect((connection.options.logger as PolarisTypeormLogger)?.logger).toEqual(
                polarisGraphQLLogger,
            );
        },
    );
    it('create connection, send typeorm config, expect connection options to have that config', async () => {
        const connection: PolarisConnection = await createPolarisConnection(
            {} as any,
            polarisGraphQLLogger,
            { allowSoftDelete: false },
        );
        expect(connection.options.extra.config.allowSoftDelete).toBeFalsy();
    });
    it('create connection, without typeorm config, expect connection options extra config to be undefined', async () => {
        const connection: PolarisConnection = await createPolarisConnection(
            {} as any,
            polarisGraphQLLogger,
        );
        expect(connection.options?.extra?.config).toBeUndefined();
    });
    it('create connection, send subscriber in options, expect connection subscribers to contain it', async () => {
        const connection: PolarisConnection = await createPolarisConnection(
            { subscribers: [''] } as any,
            polarisGraphQLLogger,
        );
        expect(connection.options.subscribers).toContain('');
    });
    it('create connection, send entity in options, expect connection entities to contain it', async () => {
        const connection: PolarisConnection = await createPolarisConnection(
            { entities: [''] } as any,
            polarisGraphQLLogger,
        );
        expect(connection.options.entities).toContain('');
    });
    it('create connection, no data version, expect initial data version to be created', async () => {
        hasId = jest.fn(() => false);
        const connection: PolarisConnection = await createPolarisConnection(
            {} as any,
            polarisGraphQLLogger,
        );
        expect(connection.manager.save).toBeCalled();
    });
});
