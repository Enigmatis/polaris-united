import {ExpressContext} from '@enigmatis/polaris-core';
import {TestContext} from './test-context';
import * as customContextFields from '../constants/custom-context-fields.json';
import {TestClassInContext} from './test-class-in-context';

export const customContext = (context: ExpressContext): Partial<TestContext> => {
    const {req, connection} = context;
    const headers = req ? req.headers : connection?.context;

    return {
        customField: customContextFields.customField,
        instanceInContext: new TestClassInContext(
            customContextFields.instanceInContext.someProperty,
        ),
        requestHeaders: {
            customHeader: headers['custom-header'],
        },
    };
};
