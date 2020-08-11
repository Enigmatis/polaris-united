import { TransactionalMutationsListener } from '../../src/transactional-mutations-plugin/transactional-mutations-listener';
import {
    LISTENER_FINISHED_JOB,
    LISTENER_ROLLING_BACK_MESSAGE,
} from '../../src/transactional-mutations-plugin/transactional-mutations-messages';
import { loggerMock } from '../mocks/logger-mock';

let transactionalMutationsListener: TransactionalMutationsListener;
let queryRunnerMock: any;

const setUpContext = (errors?: any[], response?: any): any => {
    return {
        request: {
            query: jest.fn(),
            operationName: jest.fn(),
            variables: jest.fn(),
        },
        response,
        context: jest.fn(),
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

describe('transactionalMutationsPlugin tests', () => {
    describe('willSendResponse tests', () => {
        it('requestContext contain errors and there is transaction active, the transaction rolledBack', async () => {
            const errors = [{ message: 'error 1' }, { message: 'error 2' }];
            const requestContext = setUpContext(errors, undefined);
            queryRunnerMock = setUpQueryRunnerMock(true);
            transactionalMutationsListener = new TransactionalMutationsListener(loggerMock as any, queryRunnerMock as any);

            await transactionalMutationsListener.willSendResponse(requestContext);

            expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.warn).toHaveBeenCalledTimes(1);
            expect(loggerMock.warn).toHaveBeenCalledWith(LISTENER_ROLLING_BACK_MESSAGE, requestContext.context);
            expect(loggerMock.debug).toHaveBeenCalledWith(LISTENER_FINISHED_JOB, requestContext.context);
        });

        it('requestContext contain errors and there isn\'t transaction active, nothing happened', async () => {
            const errors = [{ message: 'error 1' }, { message: 'error 2' }];
            const requestContext = setUpContext(errors, undefined);
            queryRunnerMock = setUpQueryRunnerMock(false);
            transactionalMutationsListener = new TransactionalMutationsListener(loggerMock as any, queryRunnerMock as any);

            await transactionalMutationsListener.willSendResponse(requestContext);

            expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(0);
            expect(queryRunnerMock.release).toHaveBeenCalledTimes(0);
            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledWith(LISTENER_FINISHED_JOB, requestContext.context);
        });

        it('requestContext response contain errors and there is transaction active, the transaction rolledBack', async () => {
            const response = {
                errors: [{ message: 'error 1' }, { message: 'error 2' }],
            };
            const requestContext = setUpContext(undefined, response);
            queryRunnerMock = setUpQueryRunnerMock(true);
            transactionalMutationsListener = new TransactionalMutationsListener(loggerMock as any, queryRunnerMock as any);

            await transactionalMutationsListener.willSendResponse(requestContext);

            expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.warn).toHaveBeenCalledTimes(1);
            expect(loggerMock.warn).toHaveBeenCalledWith(LISTENER_ROLLING_BACK_MESSAGE, requestContext.context);
            expect(loggerMock.debug).toHaveBeenCalledWith(LISTENER_FINISHED_JOB, requestContext.context);
        });

        it('requestContext response contain errors and there isn\'t transaction active, nothing happened', async () => {
            const response = {
                errors: [{ message: 'error 1' }, { message: 'error 2' }],
            };
            const requestContext = setUpContext(undefined, response);
            queryRunnerMock = setUpQueryRunnerMock(false);
            transactionalMutationsListener = new TransactionalMutationsListener(loggerMock as any, queryRunnerMock as any);

            await transactionalMutationsListener.willSendResponse(requestContext);

            expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(0);
            expect(queryRunnerMock.release).toHaveBeenCalledTimes(0);
            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledWith(LISTENER_FINISHED_JOB, requestContext.context);
        });
    });
});
