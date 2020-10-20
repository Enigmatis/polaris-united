import { RealitiesHolder } from '@enigmatis/polaris-common';
import { IrrelevantEntitiesMiddleware } from '../../src';

const result = [{ id: '1' }, { id: '3' }, { id: '5' }];
const irrResult = [{ id: '2' }, { id: '4' }, { id: '6' }];

const queryBuilder: any = {
    select: jest.fn(() => queryBuilder),
    where: jest.fn(() => queryBuilder),
    andWhere: jest.fn(() => queryBuilder),
    getRawMany: jest.fn(() => irrResult),
};

const repository: any = {
    createQueryBuilder: jest.fn(() => queryBuilder),
};

const connection: any = {
    getRepository: jest.fn(() => repository),
    hasRepository: jest.fn(() => true),
    getMetadata: jest.fn(() => ({
        tableName: 'foo',
    })),
} as any;
const logger = { debug: jest.fn() } as any;

const polarisConnectionManager = {
    get: jest.fn(() => connection),
    connections: [connection],
    has: jest.fn(() => true),
};
const irrelevantEntitiesMiddleware = new IrrelevantEntitiesMiddleware(
    logger,
    new RealitiesHolder(new Map([[0, { id: 0, name: 'default' }]])),
    polarisConnectionManager as any,
).getMiddleware();

describe('Irrelevant entities middleware', () => {
    describe('irrelevant entities in returned extensions', () => {
        it('context without data version, context doesnt change', async () => {
            let testContext = {} as any;
            await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {});
            expect(testContext).toEqual({});
            testContext = { requestHeaders: {} } as any;
            await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {});
            expect(testContext).toEqual({ requestHeaders: {} } as any);
            testContext = { requestHeaders: { dataVersion: undefined } } as any;
            await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {});
            expect(testContext).toEqual({ requestHeaders: { dataVersion: undefined } } as any);
        });

        it('appends irrelevant entities by query name', async () => {
            const evenIds = ['2', '4', '6'];
            const testContext = { requestHeaders: { dataVersion: 1, realityId: 0 } } as any;
            await irrelevantEntitiesMiddleware(
                jest.fn(() => result),
                undefined,
                {},
                testContext,
                {
                    returnType: { ofType: { name: 'Book' } },
                    path: { key: 'getEven' },
                },
            );

            expect(testContext.returnedExtensions.irrelevantEntities).toEqual({ getEven: evenIds });
        });

        it('keeps searching for the query type even if its complex', async () => {
            const evenIds = ['2', '4', '6'];
            const testContext = { requestHeaders: { dataVersion: 1, realityId: 0 } } as any;
            await irrelevantEntitiesMiddleware(
                jest.fn(() => result),
                undefined,
                {},
                testContext,
                {
                    returnType: { ofType: { ofType: { name: 'Book' } } },
                    path: { key: 'getEven' },
                },
            );
            expect(testContext.returnedExtensions.irrelevantEntities).toEqual({ getEven: evenIds });
        });
        it('appends irrelevant entities by query name, multiple queries', async () => {
            const evenIds = ['2', '4', '6'];
            const testContext = {
                requestHeaders: { dataVersion: 1, realityId: 0 },
                returnedExtensions: { irrelevantEntities: { getOdd: result } },
            } as any;
            await irrelevantEntitiesMiddleware(
                jest.fn(() => result),
                undefined,
                {},
                testContext,
                {
                    returnType: { ofType: { name: 'Book' } },
                    path: { key: 'getEven' },
                },
            );
            expect(testContext.returnedExtensions.irrelevantEntities).toEqual({
                getEven: evenIds,
                getOdd: result,
            });
        });

        it('not searches for irrelevant if root is defined', async () => {
            const testContext = { requestHeaders: { dataVersion: 1 } } as any;
            await irrelevantEntitiesMiddleware(jest.fn(), {}, {}, testContext, {
                returnType: { ofType: { name: 'Book' } },
                path: { key: 'getEven' },
            });
            expect(testContext.returnedExtensions).toBeUndefined();
        });

        it('not searches for irrelevant if data version is 0', async () => {
            const testContext = { requestHeaders: { dataVersion: 0, realityId: 0 } } as any;
            await irrelevantEntitiesMiddleware(
                jest.fn(() => result),
                {},
                {},
                testContext,
                {
                    returnType: { ofType: { name: 'Book' } },
                    path: { key: 'getEven' },
                },
            );
            expect(testContext.returnedExtensions).toBeUndefined();
        });

        it('not running IN query if result is empty', async () => {
            const testContext = { requestHeaders: { dataVersion: 1, realityId: 0 } } as any;
            await irrelevantEntitiesMiddleware(
                jest.fn(() => []),
                undefined,
                {},
                testContext,
                {
                    returnType: { ofType: { name: 'Book' } },
                    path: { key: 'getEven' },
                },
            );
            expect(queryBuilder.andWhere).not.toHaveBeenCalled();
        });
    });
});
