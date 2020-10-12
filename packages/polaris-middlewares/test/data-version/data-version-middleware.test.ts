import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { DataVersionMiddleware } from '../../src';
import { getContextWithRequestHeaders } from '../context-util';

const dvResult = { getValue: jest.fn(() => 1) };
const dvRepo: any = {
    findOne: jest.fn(() => dvResult),
};
const connection: any = { getRepository: jest.fn(() => dvRepo) };
const logger: any = { debug: jest.fn() };
const realitiesHolder = new RealitiesHolder();
realitiesHolder.addReality({ id: 0, name: 'default' });
const polarisConnectionManager = {
    get: jest.fn(() => connection),
    connections: [connection],
    has: jest.fn(() => true),
};
const dataVersionMiddleware = new DataVersionMiddleware(
    true,
    logger,
    realitiesHolder,
    polarisConnectionManager as any,
).getMiddleware();
const info = {
    returnType: {
        ofType: {
            ofType: {
                name: 'Author',
            },
        },
    },
    fieldNodes: [
        {
            selectionSet: {
                selections: [{}],
            },
        },
    ],
};
describe('data version middleware', () => {
    describe('root resolver', () => {
        it('should filter out entities with data version lower/equal to context', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                dataVersion: 2,
                realityId: 0,
            });
            const objects = [
                { title: 'moshe', dataVersion: 2 },
                { title: 'dani', dataVersion: 5 },
            ];
            const resolve = async () => {
                return objects;
            };
            const result = await dataVersionMiddleware(resolve, undefined, {}, context, info);
            expect(result).toEqual([{ title: 'dani', dataVersion: 5 }]);
        });
        it('no data version in context, root query, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
            const objects = [
                { title: 'moshe', dataVersion: 2 },
                { title: 'dani', dataVersion: 5 },
            ];
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, undefined, {}, context, info);
            expect(result).toEqual(objects);
        });
        it('context data version is not a number, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                dataVersion: undefined,
            });
            const objects = [
                { title: 'moshe', dataVersion: 2 },
                { title: 'dani', dataVersion: 5 },
            ];
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, undefined, {}, context, info);
            expect(result).toEqual(objects);
        });
        it('entities does not have a data version property, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                dataVersion: 3,
                realityId: 0,
            });
            const objects = [{ title: 'moshe' }, { title: 'dani' }];
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, undefined, {}, context, info);
            expect(result).toEqual(objects);
        });
        it('a single entity with data version is resolved, filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ dataVersion: 3 });
            const objects = { title: 'moshe', dataVersion: 2 };
            const resolve = async () => {
                return objects;
            };
            const result = await dataVersionMiddleware(resolve, undefined, {}, context, info);
            expect(result).toBeUndefined();
        });

        it('a single entity without data version is resolved, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                dataVersion: 3,
                realityId: 0,
            });
            const objects = { title: 'foo' };
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, undefined, {}, context, info);
            expect(result).toEqual(objects);
        });
    });
    describe('not a root resolver', () => {
        it('not a root resolver, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                dataVersion: 3,
                realityId: 0,
            });
            const objects = [
                { title: 'moshe', dataVersion: 2 },
                { title: 'dani', dataVersion: 5 },
            ];
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, { name: 'bla' }, {}, context, info);
            expect(result).toEqual(objects);
        });
    });
    describe('update global data version extensions in context', () => {
        it('global data version is undefined in context, update global data version in extensions', async () => {
            const context: any = getContextWithRequestHeaders({
                dataVersion: 2,
                realityId: 0,
            });
            context.returnedExtensions = undefined;
            const objects = [
                { title: 'moshe', dataVersion: 2 },
                { title: 'dani', dataVersion: 5 },
            ];
            const resolve = async () => {
                return objects;
            };
            const result = await dataVersionMiddleware(resolve, undefined, {}, context, info);
            expect(result).toEqual([{ title: 'dani', dataVersion: 5 }]);
            expect(context?.returnedExtensions?.globalDataVersion).toEqual(1);
            expect(dvRepo.findOne.mock.calls.length).toBe(1);
        });

        it('global data version is already in extensions, should not try to fetch from db', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                dataVersion: 2,
                realityId: 0,
            });
            const objects = [
                { title: 'moshe', dataVersion: 2 },
                { title: 'dani', dataVersion: 5 },
            ];
            const resolve = async () => {
                return objects;
            };
            const result = await dataVersionMiddleware(resolve, undefined, {}, context, info);
            expect(result).toEqual([{ title: 'dani', dataVersion: 5 }]);
            expect(dvRepo.findOne.mock.calls.length).toBe(0);
        });

        it('global data version not found, throw error', async () => {
            const context: any = getContextWithRequestHeaders({ dataVersion: 2, realityId: 0 });
            context.returnedExtensions = undefined;
            const objects = [
                { title: 'moshe', dataVersion: 2 },
                { title: 'dani', dataVersion: 5 },
            ];
            const resolve = async () => {
                return objects;
            };
            dvRepo.findOne = jest.fn(() => undefined);
            try {
                await dataVersionMiddleware(resolve, undefined, {}, context, info);
            } catch (e) {
                expect(e.message).toEqual('no data version found in db');
            }
        });
    });
});
