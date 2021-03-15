import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { DeprecatedFieldsMiddleware } from '../../src';
import { getContextWithRequestHeaders } from '../context-util';

const logger: any = { debug: jest.fn() };
const deprecatedFieldsMiddleware = new DeprecatedFieldsMiddleware(logger).getMiddleware();
const fieldName = 'foo';
const infoWithDeprecated = {
    fieldName,
    parentType: {
        getFields: jest.fn().mockReturnValue({
            foo: {
                isDeprecated: true,
            },
        }),
    },
} as any;
const infoWithoutDeprecated = {
    fieldName,
    parentType: {
        getFields: jest.fn().mockReturnValue({
            foo: {
                isDeprecated: false,
            },
        }),
    },
} as any;
describe('deprecated fields middleware', () => {
    it('query entity with deprecated field, field name is pushed to requestedDeprecatedFields in the context', async () => {
        const objects = [{ firstName: 'foo', foo: 'hi' }, { firstName: 'foo' }];
        const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
        const resolve = async () => {
            return objects;
        };
        await deprecatedFieldsMiddleware(resolve, undefined, {}, context, infoWithDeprecated);
        expect(context.requestedDeprecatedFields.length).toEqual(1);
        expect(context.requestedDeprecatedFields[0]).toEqual(fieldName);
    });
    it('query entity without deprecated field, field name is not pushed to requestedDeprecatedFields in the context', async () => {
        const objects = [{ firstName: 'foo', foo: 'hi' }, { firstName: 'foo' }];
        const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
        const resolve = async () => {
            return objects;
        };
        await deprecatedFieldsMiddleware(resolve, undefined, {}, context, infoWithoutDeprecated);
        expect(context.requestedDeprecatedFields.length).toEqual(0);
    });
});
