import { DataVersionMiddleware } from '../../src';
import { getContextWithRequestHeaders } from '../context-util';

const dvResult = { getValue: jest.fn(() => 1) };
const dvRepo: any = {
    findOne: jest.fn(() => dvResult),
};
const connection: any = { getRepository: jest.fn(() => dvRepo) };
const logger: any = { debug: jest.fn() };
const dataVersionMiddleware = new DataVersionMiddleware(logger, connection).getMiddleware();
const polarisTypeORMModule = require('@enigmatis/polaris-typeorm');
Object.defineProperty(polarisTypeORMModule, "getPolarisConnectionManager", ()=>{
    return { get: jest.fn, connections: [] };
});
describe('data version middleware', () => {
    it('no connection, extensions were not added', async () => {
        const context: any = getContextWithRequestHeaders({ dataVersion: 2 });
        context.returnedExtensions = undefined;
        const objects = [
            { title: 'moshe', dataVersion: 2 },
            { title: 'dani', dataVersion: 5 },
        ];
        const resolve = async () => {
            return objects;
        };
        await dataVersionMiddleware(resolve, undefined, {}, context, {});
        expect(context.returnedExtensions).toBeUndefined();
    });
});
