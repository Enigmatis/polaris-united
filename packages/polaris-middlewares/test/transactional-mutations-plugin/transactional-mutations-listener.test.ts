import { TransactionalRequestsListener } from '../../src/transactional-requests-plugin/transactional-requests-listener';
import {
    LISTENER_FINISHED_JOB,
    LISTENER_ROLLING_BACK_MESSAGE,
} from '../../src/transactional-requests-plugin/transactional-requests-messages';
import { loggerMock } from '../mocks/logger-mock';

let transactionalMutationsListener: TransactionalRequestsListener;
let queryRunnerMock: any;

const setUpContext = (errors?: any[], response?: any): any => {
    return {
        request: {
            query: jest.fn(),
            operationName: jest.fn(),
            variables: jest.fn(),
        },
        response,
        context: { requestHeaders: { requestId: '1' } },
        errors,
    };
};

const setUpQueryRunnerMock = (isTransactionActive: boolean): any => {
    return {
        isTransactionActive,
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        release: jest.fn(),
    };
};
const connectionMock = {
    addPolarisEntityManager: jest.fn(),
    removePolarisEntityManager: jest.fn(),
    createQueryRunner: jest.fn(() => queryRunnerMock),
    addQueryRunner: jest.fn(),
    removeQueryRunner: jest.fn(),
};
describe('transactionalMutationsPlugin tests', () => {
    describe('willSendResponse tests', () => {
        it('requestContext contain errors and there is transaction active, the transaction rolledBack', async () => {
            const errors = [{ message: 'error 1' }, { message: 'error 2' }];
            const requestContext = setUpContext(errors, undefined);
            queryRunnerMock = setUpQueryRunnerMock(true);
            connectionMock.createQueryRunner = jest.fn(() => queryRunnerMock);
            transactionalMutationsListener = new TransactionalRequestsListener(
                loggerMock as any,
                connectionMock as any,
                requestContext.context
            );
            await transactionalMutationsListener.responseForOperation(requestContext);
            await transactionalMutationsListener.willSendResponse(requestContext);

            expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.warn).toHaveBeenCalledTimes(1);
            expect(loggerMock.warn).toHaveBeenCalledWith(
                LISTENER_ROLLING_BACK_MESSAGE,
                requestContext.context,
            );
            expect(loggerMock.debug).toHaveBeenCalledWith(
                LISTENER_FINISHED_JOB,
                requestContext.context,
            );
        });

        it("requestContext contain errors and there isn't transaction active, nothing happened", async () => {
            const errors = [{ message: 'error 1' }, { message: 'error 2' }];
            const requestContext = setUpContext(errors, undefined);
            queryRunnerMock = setUpQueryRunnerMock(false);
            connectionMock.createQueryRunner = jest.fn(() => queryRunnerMock);
            transactionalMutationsListener = new TransactionalRequestsListener(
                loggerMock as any,
                connectionMock as any,
                requestContext.context
            );
            await transactionalMutationsListener.responseForOperation(requestContext);
            await transactionalMutationsListener.willSendResponse(requestContext);

            expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(0);
            expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledWith(
                LISTENER_FINISHED_JOB,
                requestContext.context,
            );
        });

        it('requestContext response contain errors and there is transaction active, the transaction rolledBack', async () => {
            const response = {
                errors: [{ message: 'error 1' }, { message: 'error 2' }],
            };
            const requestContext = setUpContext(undefined, response);
            queryRunnerMock = setUpQueryRunnerMock(true);
            connectionMock.createQueryRunner = jest.fn(() => queryRunnerMock);
            transactionalMutationsListener = new TransactionalRequestsListener(
                loggerMock as any,
                connectionMock as any,
                requestContext.context
            );
            await transactionalMutationsListener.responseForOperation(requestContext);
            await transactionalMutationsListener.willSendResponse(requestContext);

            expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.warn).toHaveBeenCalledTimes(1);
            expect(loggerMock.warn).toHaveBeenCalledWith(
                LISTENER_ROLLING_BACK_MESSAGE,
                requestContext.context,
            );
            expect(loggerMock.debug).toHaveBeenCalledWith(
                LISTENER_FINISHED_JOB,
                requestContext.context,
            );
        });

        it("requestContext response contain errors and there isn't transaction active, nothing happened", async () => {
            const response = {
                errors: [{ message: 'error 1' }, { message: 'error 2' }],
            };
            const requestContext = setUpContext(undefined, response);
            queryRunnerMock = setUpQueryRunnerMock(false);
            connectionMock.createQueryRunner = jest.fn(() => queryRunnerMock);
            transactionalMutationsListener = new TransactionalRequestsListener(
                loggerMock as any,
                connectionMock as any,
                requestContext.context
            );
            await transactionalMutationsListener.responseForOperation(requestContext);
            await transactionalMutationsListener.willSendResponse(requestContext);

            expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(0);
            expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledWith(
                LISTENER_FINISHED_JOB,
                requestContext.context,
            );
        });
    });
});
