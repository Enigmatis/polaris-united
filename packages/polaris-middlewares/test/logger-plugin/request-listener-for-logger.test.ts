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
    const context: any = { logDocumentId: 'id', requestStartedTime: 1000 };
    const response: any = {
        data: { a: [{}, {}], b: {} },
        extensions: jest.fn(),
        errors: jest.fn(),
    };
    const document = {
        definitions: [
            {
                selectionSet: { selections: [{ name: { value: 'a' } }] },
            },
        ],
    };
    const requestContext: any = { context, response, document };

    describe('willSendResponse tests', () => {
        test('a log is written with response', async () => {
            await listener.willSendResponse(requestContext);

            expect(loggerMock.info).toHaveBeenCalledWith(RESPONSE_SENT, context, {
                response,
                customProperties: {
                    affectedEntitiesCount: 3,
                    esc_doc_id: 'id',
                    responseHeaders: undefined,
                },
                elapsedTime: expect.anything(),
                eventKind: '180002',
            });
        });
    });
    describe('executionDidStart tests', () => {
        test('a log is written', () => {
            listener.executionDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledWith(EXECUTION_BEGAN, context);
        });
    });
    describe('parsingDidStart tests', () => {
        test('a log is written', () => {
            listener.parsingDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledWith(PARSING_BEGAN, context);
        });
    });
    describe('validationDidStart tests', () => {
        test('a log is written', () => {
            listener.validationDidStart(requestContext);

            expect(loggerMock.info).toHaveBeenCalledWith(VALIDATION_BEGAN, context, {
                customProperties: {
                    esc_doc_id: 'id',
                    queryName: 'a',
                },
            });
        });
    });
});
