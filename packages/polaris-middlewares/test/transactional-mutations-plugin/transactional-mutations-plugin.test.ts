import { RealitiesHolder } from '@enigmatis/polaris-common';
import { QueryRunner } from '@enigmatis/polaris-typeorm';
import { TransactionalMutationsPlugin } from '../../src';
import { PLUGIN_STARTED_JOB } from '../../src/transactional-mutations-plugin/transactional-mutations-messages';
import { loggerMock } from '../mocks/logger-mock';
let transactionalMutationsPlugin: TransactionalMutationsPlugin;
const realitiesHolder: RealitiesHolder = new RealitiesHolder(
    new Map([[0, { id: 0, name: 'default' }]]),
);

const setUpContext = (query: string): any => {
    return {
        request: {
            query,
            operationName: jest.fn(),
            variables: jest.fn(),
        },
        context: {
            requestHeaders: jest.fn(),
        },
    };
};

const getPolarisConnectionManager = (queryRunner: Partial<QueryRunner>) => {
    const returnValue = {
        connections: {
            length: 1,
        },
        has: jest.fn(() => true),
        get: jest.fn(() => {
            return {
                manager: {
                    queryRunner,
                },
                createQueryRunner: () => queryRunner,
            };
        }),
    };
    return returnValue as any;
};

describe('transactionalMutationsPlugin tests', () => {
    describe('requestDidStart tests - execute queries', () => {
        it("execute a query, the logger wasn't called - the function wasn't executed", () => {
            const query =
                '{\n  allBooks {\n    id\n    title\n    author {\n      firstName\n      lastName\n    }\n  }\n}\n';
            const requestContext = setUpContext(query);
            transactionalMutationsPlugin = new TransactionalMutationsPlugin(
                loggerMock as any,
                realitiesHolder,
                getPolarisConnectionManager({}),
            );
            transactionalMutationsPlugin.requestDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledTimes(0);
        });
    });

    describe('requestDidStart tests - execute mutations', () => {
        it('execute a mutation and start transaction throws an error, an error thrown and logger and rollback called', () => {
            const errorMessage = 'error';
            const queryRunner: Partial<QueryRunner> = {
                isTransactionActive: false,
                startTransaction: jest.fn().mockImplementation(() => {
                    throw new Error(errorMessage);
                }),
                rollbackTransaction: jest.fn(),
            };
            transactionalMutationsPlugin = new TransactionalMutationsPlugin(
                loggerMock as any,
                realitiesHolder,
                getPolarisConnectionManager(queryRunner),
            );
            const mutation = 'mutation....';
            const requestContext = setUpContext(mutation);

            expect(() => transactionalMutationsPlugin.requestDidStart(requestContext)).toThrow();

            expect(loggerMock.error).toHaveBeenCalledTimes(1);
            expect(loggerMock.error).toHaveBeenCalledWith(errorMessage, requestContext.context);
        });

        it("execute a mutation and there isn't transaction active, start transaction was called", () => {
            const queryRunner: Partial<QueryRunner> = {
                isTransactionActive: false,
                startTransaction: jest.fn(),
            };
            transactionalMutationsPlugin = new TransactionalMutationsPlugin(
                loggerMock as any,
                realitiesHolder,
                getPolarisConnectionManager(queryRunner),
            );
            const mutation = 'mutation....';
            const requestContext = setUpContext(mutation);

            transactionalMutationsPlugin.requestDidStart(requestContext);

            expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
        });

        it('execute a mutation, the logger was called', () => {
            const queryRunner: Partial<QueryRunner> = {
                isTransactionActive: true,
                startTransaction: jest.fn(),
            };
            transactionalMutationsPlugin = new TransactionalMutationsPlugin(
                loggerMock as any,
                realitiesHolder,
                getPolarisConnectionManager(queryRunner),
            );
            const mutation = 'mutation....';
            const requestContext = setUpContext(mutation);

            transactionalMutationsPlugin.requestDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledWith(
                PLUGIN_STARTED_JOB,
                requestContext.context,
            );
        });
    });
});
