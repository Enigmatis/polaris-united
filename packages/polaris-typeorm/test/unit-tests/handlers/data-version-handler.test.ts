import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { DataVersion } from '../../../src';
import { DataVersionHandler } from '../../../src/handlers/data-version-handler';

let getRawOne: any;
const manager = {
    createQueryBuilder: jest.fn(() => {
        return {
            from: jest.fn(() => {
                return {
                    useTransaction: jest.fn(() => {
                        return {
                            setLock: jest.fn(() => {
                                return { getRawOne };
                            }),
                        };
                    }),
                };
            }),
        };
    }),
    context: {},
};
const qrMock: any = {
    manager: {
        getRepository: jest.fn(() => {
            return manager;
        }),
        createQueryBuilder: manager.createQueryBuilder,
        save: jest.fn(),
        increment: jest.fn(),
    },
    isTransactionActive: jest.fn(),
    startTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
};
describe('data version handler tests', () => {
    it('data version table empty, global data version in extensions and db created', async () => {
        const connection = { logger: { log: jest.fn() } } as any;
        getRawOne = jest.fn();
        qrMock.manager.context = { returnedExtensions: {} } as PolarisGraphQLContext;
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        await dataVersionHandler.updateDataVersion(connection, qrMock.manager);
        expect(qrMock.manager.save).toBeCalledWith(DataVersion, new DataVersion(1));
        expect(qrMock.manager.context.returnedExtensions.dataVersion).toEqual(2);
    });
    it('no global data version in extensions but exist in db, data version incremented and saved to db and extensions', async () => {
        const connection = { logger: { log: jest.fn() } } as any;
        getRawOne = jest
            .fn()
            .mockResolvedValueOnce(new DataVersion(1))
            .mockResolvedValueOnce(new DataVersion(2));
        qrMock.manager.context = { returnedExtensions: {} } as PolarisGraphQLContext;
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        await dataVersionHandler.updateDataVersion(connection, qrMock.manager);
        expect(qrMock.manager.increment).toBeCalledWith(DataVersion, {}, 'value', 1);
        expect(qrMock.manager.context.returnedExtensions.dataVersion).toEqual(2);
    });
    it('global data version in extensions and not in db, throws error', async () => {
        getRawOne = jest.fn();
        const connection = { logger: { log: jest.fn() } } as any;
        qrMock.manager.context = {
            returnedExtensions: { dataVersion: 1 },
        } as PolarisGraphQLContext;
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        try {
            await dataVersionHandler.updateDataVersion(connection, qrMock.manager);
        } catch (e) {
            expect(e.message).toEqual(
                'data version in context even though the data version table is empty',
            );
            expect(qrMock.manager.context.returnedExtensions.dataVersion).toEqual(1);
        }
    });
    it('global data version in extensions but does not equal to data version in db, throws error', async () => {
        getRawOne = jest.fn(() => new DataVersion(2));
        const connection = { logger: { log: jest.fn() } } as any;
        qrMock.manager.context = {
            returnedExtensions: { dataVersion: 1 },
        } as PolarisGraphQLContext;
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        try {
            await dataVersionHandler.updateDataVersion(connection, qrMock.manager);
        } catch (err) {
            expect(err.message).toEqual(
                'data version in context does not equal data version in table',
            );
            expect(qrMock.manager.context.returnedExtensions.dataVersion).toEqual(1);
        }
    });
    it('global data version in extensions and equal to data version in db, data version does not increment', async () => {
        getRawOne = jest.fn(() => {
            return new DataVersion(1);
        });
        const connection = { logger: { log: jest.fn() } } as any;
        qrMock.manager.context = {
            returnedExtensions: { dataVersion: 1 },
        } as PolarisGraphQLContext;
        const dataVersionHandler: DataVersionHandler = new DataVersionHandler();
        await dataVersionHandler.updateDataVersion(connection, qrMock.manager);
        expect(qrMock.manager.increment).not.toHaveBeenCalled();
        expect(qrMock.manager.context.returnedExtensions.dataVersion).toEqual(1);
    });
});
