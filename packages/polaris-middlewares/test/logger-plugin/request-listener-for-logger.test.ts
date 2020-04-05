import {
    EXECUTION_BEGAN,
    PARSING_BEGAN,
    RESPONSE_SENT,
    VALIDATION_BEGAN,
} from '../../src/logger-plugin/logger-plugin-messages';
import { PolarisRequestListener } from '../../src/logger-plugin/polaris-request-listener';
import { loggerMock } from '../mocks/logger-mock';

describe('RequestListenerForLoggerPlugin tests', () => {
    const listener = new PolarisRequestListener(loggerMock as any);
    const context: any = {};
    const response: any = {
        data: jest.fn(),
        extensions: jest.fn(),
        errors: jest.fn(),
    };
    const requestContext: any = { context, response };

    describe('willSendResponse tests', () => {
        test('a log is written with response', async () => {
            await listener.willSendResponse(requestContext);

            expect(loggerMock.info).toHaveBeenCalledWith(
                RESPONSE_SENT,
                context,
                { response },
            );
        });
    });
    describe('executionDidStart tests', () => {
        test('a log is written', () => {
            listener.executionDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledWith(
                EXECUTION_BEGAN,
                context,
            );
        });
    });
    describe('parsingDidStart tests', () => {
        test('a log is written', () => {
            listener.parsingDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledWith(
                PARSING_BEGAN,
                context,
            );
        });
    });
    describe('validationDidStart tests', () => {
        test('a log is written', () => {
            listener.validationDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledWith(
                VALIDATION_BEGAN,
                context,
            );
        });
    });
});
