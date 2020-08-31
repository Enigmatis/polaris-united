import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { DataVersion } from '../../../src';
import { DataVersionHandler } from '../../../src/handlers/data-version-handler';

describe('data version handler tests', () => {
    it('data version table empty, global data version in extensions and db created', async () => {
        const connection = {
            manager: {
                connection: {},
                findOne: jest.fn(),
                save: jest.fn(),
            },
            logger: { log: jest.fn() },
        } as any;
        const context = { returnedExtensions: {} } as PolarisGraphQLContext;
        Object.assign(connection.manager.connection, connection);
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        await dataVersionHandler.updateDataVersion(context, connection);
        expect(connection.manager.save).toBeCalledWith(DataVersion, new DataVersion(1));
        expect(context.returnedExtensions.globalDataVersion).toEqual(1);
    });
    it('no global data version in extensions but exist in db, data version incremented and saved to db and extensions', async () => {
        const connection = {
            manager: {
                connection: {},
                findOne: jest
                    .fn()
                    .mockResolvedValueOnce(new DataVersion(1))
                    .mockResolvedValueOnce(new DataVersion(2)),
                save: jest.fn(),
                increment: jest.fn(),
            },
            logger: { log: jest.fn() },
        } as any;
        const context = {
            returnedExtensions: {},
        } as PolarisGraphQLContext;
        Object.assign(connection.manager.connection, connection);
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        await dataVersionHandler.updateDataVersion(context, connection);
        expect(connection.manager.increment).toBeCalledWith(DataVersion, {}, 'value', 1);
        expect(context.returnedExtensions.globalDataVersion).toEqual(2);
    });
    it('global data version in extensions and not in db, throws error', async () => {
        const connection = {
            manager: {
                connection: {},
                findOne: jest.fn(),
                save: jest.fn(),
                increment: jest.fn(),
            },
            logger: { log: jest.fn() },
        } as any;
        const context = { returnedExtensions: { globalDataVersion: 1 } } as PolarisGraphQLContext;

        Object.assign(connection.manager.connection, connection);
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        try {
            await dataVersionHandler.updateDataVersion(context, connection);
        } catch (e) {
            expect(e.message).toEqual(
                'data version in context even though the data version table is empty',
            );
            expect(context.returnedExtensions.globalDataVersion).toEqual(1);
        }
    });
    it('global data version in extensions but does not equal to data version in db, throws error', async () => {
        const connection = {
            manager: {
                connection: {},
                findOne: jest.fn().mockResolvedValueOnce(new DataVersion(2)),
                save: jest.fn(),
                increment: jest.fn(),
            },
            logger: { log: jest.fn() },
        } as any;
        const context = { returnedExtensions: { globalDataVersion: 1 } } as PolarisGraphQLContext;
        Object.assign(connection.manager.connection, connection);
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        try {
            await dataVersionHandler.updateDataVersion(context, connection);
        } catch (err) {
            expect(err.message).toEqual(
                'data version in context does not equal data version in table',
            );
            expect(context.returnedExtensions.globalDataVersion).toEqual(1);
        }
    });
    it('global data version in extensions and equal to data version in db, data version does not increment', async () => {
        const connection = {
            manager: {
                connection: {},
                findOne: jest.fn().mockResolvedValueOnce(new DataVersion(1)),
                save: jest.fn(),
                increment: jest.fn(),
            },
            logger: { log: jest.fn() },
        } as any;
        const context = { returnedExtensions: { globalDataVersion: 1 } } as PolarisGraphQLContext;

        Object.assign(connection.manager.connection, connection);
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        await dataVersionHandler.updateDataVersion(context, connection);
        expect(connection.manager.increment).not.toHaveBeenCalled();
        expect(context.returnedExtensions.globalDataVersion).toEqual(1);
    });
});
