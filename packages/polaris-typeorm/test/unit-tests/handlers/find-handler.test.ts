import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { In } from 'typeorm';
import { FindHandler } from '../../../src/handlers/find-handler';
const createNewQB = () => {
    const qb: any = {
        alias: 'author',
        expressionMap: {
            wheres: [],
        },
        where: jest.fn((condition, parameters) => {
            qb.expressionMap.wheres = [{ condition, parameters }];
            return qb;
        }),
        andWhere: jest.fn((condition, parameters) => {
            if (qb.expressionMap.wheres.length === 0) {
                throw new Error();
            }
            qb.expressionMap.wheres.push({ condition, parameters });
            return qb;
        }),
        andWhereInIds: jest.fn(),
    };
    return qb;
};
describe('find handler tests', () => {
    it('name property supplied in options or conditions, get with name condition', async () => {
        const findHandler = new FindHandler();
        let testQB = createNewQB();
        testQB = findHandler.applyFindConditionsToQueryBuilder(
            true,
            {} as PolarisGraphQLContext,
            testQB,
            {
                where: { name: 'chen' },
            },
        );
        expect(testQB.expressionMap.wheres.length).toBe(3);
        expect(testQB.expressionMap.wheres[0].condition).toBe('author.realityId = :realityId');
        expect(testQB.expressionMap.wheres[0].parameters).toEqual({ realityId: 0 });
        expect(testQB.expressionMap.wheres[1].condition).toEqual({ name: 'chen' });
        expect(testQB.expressionMap.wheres[2].condition).toBe('author.deleted = :deleted');
        expect(testQB.expressionMap.wheres[2].parameters).toEqual({ deleted: false });
    });

    it('realityId property supplied in options or conditions and not in the headers, get condition of given reality', async () => {
        const findHandler = new FindHandler();
        let testQB = createNewQB();
        testQB = findHandler.applyFindConditionsToQueryBuilder(
            true,
            {} as PolarisGraphQLContext,
            testQB,
            { where: { realityId: 3 } },
        );
        expect(testQB.expressionMap.wheres.length).toBe(2);
        expect(testQB.expressionMap.wheres[0].condition).toEqual({ realityId: 3 });
        expect(testQB.expressionMap.wheres[1].condition).toBe('author.deleted = :deleted');
        expect(testQB.expressionMap.wheres[1].parameters).toEqual({ deleted: false });
    });

    it('include linked oper is true in headers, get realities of real and reality in headers', async () => {
        const context = {
            requestHeaders: { realityId: 1, includeLinkedOper: true },
        } as PolarisGraphQLContext;
        const findHandler = new FindHandler();
        let testQB = createNewQB();
        testQB = findHandler.applyFindConditionsToQueryBuilder(true, context, testQB, {});
        expect(testQB.expressionMap.wheres.length).toBe(2);
        expect(testQB.expressionMap.wheres[0].condition).toBe('author.realityId = :realityId');
        expect(testQB.expressionMap.wheres[0].parameters).toEqual({ realityId: In([1, 0]) });
        expect(testQB.expressionMap.wheres[1].condition).toBe('author.deleted = :deleted');
        expect(testQB.expressionMap.wheres[1].parameters).toEqual({ deleted: false });
    });

    it('include linked oper is true in headers, get condition of default reality', async () => {
        const context = {
            requestHeaders: { realityId: 0, includeLinkedOper: true },
        } as PolarisGraphQLContext;
        const findHandler = new FindHandler();
        let testQB = createNewQB();
        testQB = findHandler.applyFindConditionsToQueryBuilder(true, context, testQB, {});
        expect(testQB.expressionMap.wheres.length).toBe(2);
        expect(testQB.expressionMap.wheres[0].condition).toBe('author.realityId = :realityId');
        expect(testQB.expressionMap.wheres[0].parameters).toEqual({ realityId: 0 });
        expect(testQB.expressionMap.wheres[1].condition).toBe('author.deleted = :deleted');
        expect(testQB.expressionMap.wheres[1].parameters).toEqual({ deleted: false });
    });

    it('include linked oper is true in headers but false in find setting, get condition of reality in headers', async () => {
        const context = {
            requestHeaders: { realityId: 1, includeLinkedOper: true },
        } as PolarisGraphQLContext;
        const findHandler = new FindHandler();
        let testQB = createNewQB();
        testQB = findHandler.applyFindConditionsToQueryBuilder(false, context, testQB, {});
        expect(testQB.expressionMap.wheres.length).toBe(2);
        expect(testQB.expressionMap.wheres[0].condition).toBe('author.realityId = :realityId');
        expect(testQB.expressionMap.wheres[0].parameters).toEqual({ realityId: 1 });
        expect(testQB.expressionMap.wheres[1].condition).toBe('author.deleted = :deleted');
        expect(testQB.expressionMap.wheres[1].parameters).toEqual({ deleted: false });
    });

    it('deleted property supplied in options or conditions, get condition of supplied setting', async () => {
        const findHandler = new FindHandler();
        let testQB = createNewQB();
        testQB = findHandler.applyFindConditionsToQueryBuilder(
            true,
            {} as PolarisGraphQLContext,
            testQB,
            {
                where: { deleted: true },
            },
        );
        expect(testQB.expressionMap.wheres.length).toBe(2);
        expect(testQB.expressionMap.wheres[0].condition).toBe('author.realityId = :realityId');
        expect(testQB.expressionMap.wheres[0].parameters).toEqual({ realityId: 0 });
        expect(testQB.expressionMap.wheres[1].condition).toEqual({ deleted: true });
    });

    it('linked oper supplied in header property, supplied in options or conditions, get only from headers reality', async () => {
        const findHandler = new FindHandler();
        let testQB = createNewQB();
        testQB = findHandler.applyFindConditionsToQueryBuilder(
            true,
            { requestHeaders: { realityId: 1 } } as PolarisGraphQLContext,
            testQB,
            { where: { includeLinkedOper: true } },
        );

        expect(testQB.expressionMap.wheres.length).toBe(3);
        expect(testQB.expressionMap.wheres[0].condition).toBe('author.realityId = :realityId');
        expect(testQB.expressionMap.wheres[0].parameters).toEqual({ realityId: 1 });
        expect(testQB.expressionMap.wheres[1].condition).toEqual({ includeLinkedOper: true });
        expect(testQB.expressionMap.wheres[2].condition).toBe('author.deleted = :deleted');
        expect(testQB.expressionMap.wheres[2].parameters).toEqual({ deleted: false });
    });
});
