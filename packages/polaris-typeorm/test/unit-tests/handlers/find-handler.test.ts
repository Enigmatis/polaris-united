import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { FindManyOptions, In } from 'typeorm';
import { FindHandler } from '../../../src/handlers/find-handler';

describe('find handler tests', () => {
    it('dataVersion property supplied in options or conditions and not in headers, get with data version condition', async () => {
        const findHandler = new FindHandler();
        const find = findHandler.findConditions(true, {} as PolarisGraphQLContext, {
            where: { dataVersion: 5 },
        });
        expect(find).toEqual({ where: { deleted: false, realityId: 0, dataVersion: 5 } });
    });

    it('realityId property supplied in options or conditions and not in the headers, get condition of given reality', async () => {
        const findHandler = new FindHandler();
        const find = findHandler.findConditions(true, {} as PolarisGraphQLContext, {
            where: { realityId: 3 },
        });
        expect(find).toEqual({ where: { deleted: false, realityId: 3 } });
    });

    it('include linked oper is true in headers, get realities of real and reality in headers', async () => {
        const context = {
            requestHeaders: { realityId: 1, includeLinkedOper: true },
        } as PolarisGraphQLContext;
        const findHandler = new FindHandler();
        const find = findHandler.findConditions(true, context, {});
        expect(find).toEqual({ where: { deleted: false, realityId: In([1, 0]) } });
    });

    it('include linked oper is true in headers, get condition of default reality', async () => {
        const context = {
            requestHeaders: { realityId: 0, includeLinkedOper: true },
        } as PolarisGraphQLContext;
        const findHandler = new FindHandler();
        const find = findHandler.findConditions(true, context, {});
        expect(find).toEqual({ where: { deleted: false, realityId: 0 } });
    });

    it('include linked oper is true in headers but false in find setting, get condition of reality in headers', async () => {
        const context = {
            requestHeaders: { realityId: 1, includeLinkedOper: true },
        } as PolarisGraphQLContext;
        const findHandler = new FindHandler();
        const find = findHandler.findConditions(false, context, {});
        expect(find).toEqual({ where: { deleted: false, realityId: 1 } });
    });

    it('deleted property supplied in options or conditions, get condition of supplied setting', async () => {
        const findHandler = new FindHandler();
        const find = findHandler.findConditions(true, {} as PolarisGraphQLContext, {
            where: { deleted: true },
        });
        expect(find).toEqual({ where: { deleted: true, realityId: 0 } });
    });

    it('linked oper supplied in header property, supplied in options or conditions, get only from headers reality', async () => {
        const findHandler = new FindHandler();
        const find = findHandler.findConditions(
            true,
            { requestHeaders: { realityId: 1 } } as PolarisGraphQLContext,
            { where: { includeLinkedOper: true } },
        );
        expect(find).toEqual({ where: { deleted: false, realityId: 1, includeLinkedOper: true } });
    });
});
