jest.mock('@enigmatis/polaris-typeorm');
import { RealitiesHolder } from '@enigmatis/polaris-common';
import { TransactionalRequestsPlugin } from '../../src';
import { PLUGIN_STARTED_JOB } from '../../src/transactional-requests-plugin/transactional-requests-messages';
import { loggerMock } from '../mocks/logger-mock';
import { getConnectionForReality } from "@enigmatis/polaris-typeorm";

let transactionalMutationsPlugin: TransactionalRequestsPlugin;
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

const getPolarisConnectionManager = () => {
    const returnValue = {
        connections: {
            length: 1,
        },
        has: jest.fn(() => true),
        get: jest.fn(),
    };
    return returnValue as any;
};
// @ts-ignore
getConnectionForReality.mockReturnValue({ createQueryRunner: jest.fn });

describe('transactionalMutationsPlugin tests', () => {
    describe('requestDidStart tests - execute queries', () => {
        it("execute a query, the logger was called", () => {
            const query =
                '{\n  allBooks {\n    id\n    title\n    author {\n      firstName\n      lastName\n    }\n  }\n}\n';
            const requestContext = setUpContext(query);
            transactionalMutationsPlugin = new TransactionalRequestsPlugin(
                loggerMock as any,
                realitiesHolder,
                getPolarisConnectionManager(),
            );
            transactionalMutationsPlugin.requestDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledWith(
                PLUGIN_STARTED_JOB,
                requestContext.context,
            );
        });
    });

    describe('requestDidStart tests - execute mutations', () => {
        it('execute a mutation, the logger was called', () => {
            transactionalMutationsPlugin = new TransactionalRequestsPlugin(
                loggerMock as any,
                realitiesHolder,
                getPolarisConnectionManager(),
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
