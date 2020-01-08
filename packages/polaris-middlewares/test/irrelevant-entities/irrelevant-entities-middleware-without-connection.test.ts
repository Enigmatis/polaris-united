import { IrrelevantEntitiesMiddleware } from '../../src';

const connection = { getRepository: jest.fn() } as any;
const logger = { debug: jest.fn() } as any;
const irrelevantEntitiesMiddleware = new IrrelevantEntitiesMiddleware(
    logger,
    connection,
).getMiddleware();

const polarisTypeormModule = require('@enigmatis/polaris-typeorm');
polarisTypeormModule.getConnectionManager = jest.fn(() => {
    return { get: jest.fn(() => connection), connections: [connection] };
});

describe('no connection', () => {
    it('no irrelevant entities in returned extensions', async () => {
        const testContext = { returnedExtensions: {} } as any;
        await irrelevantEntitiesMiddleware(jest.fn(), undefined, {}, testContext, {});
        expect(testContext.returnedExtensions.irrelevantEntities).toBeUndefined();
    });
});
