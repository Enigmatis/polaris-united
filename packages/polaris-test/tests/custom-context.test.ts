import * as customContextFields from '../shared-resources/constants/custom-context-fields.json';
import {graphQLRequest} from '../test-utils/graphql-client';
import {createServers} from '../test-utils/tests-servers-util';
import * as customHeadersRequest from './jsonRequestsAndHeaders/authorsByFirstNameFromCustomHeader.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as customContextCustomFieldRequest from './jsonRequestsAndHeaders/customContextCustomField.json';
import * as customContextInstanceMethodRequest from './jsonRequestsAndHeaders/customContextInstanceMethod.json';

describe('custom context tests', () => {
    test.each(createServers())(
        'querying author by custom header in the custom context',
        async (server) => {
            await server.start();
            const author = { firstName: 'first1', lastName: 'last' };
            await graphQLRequest(createAuthor.request, {}, author);
            const result: any = await graphQLRequest(customHeadersRequest.query, {
                'reality-id': 0,
                'custom-header': 1,
            });

            expect(result.authorsByFirstNameFromCustomHeader[0].firstName).toEqual(
                author.firstName,
            );
            expect(result.authorsByFirstNameFromCustomHeader[0].realityId).toEqual(0);
            await server.stop();
        },
    );
    test.each(createServers())('querying custom field in the custom context', async (server) => {
        await server.start();
        const result: any = await graphQLRequest(
            customContextCustomFieldRequest.query,
            customContextCustomFieldRequest.headers,
        );

        expect(result.customContextCustomField).toEqual(customContextFields.customField);
        await server.stop();
    });
    test.each(createServers())(
        'querying method of a TestClassInContext instance in the custom context',
        async (server) => {
            await server.start();
            const result: any = await graphQLRequest(
                customContextInstanceMethodRequest.query,
                customContextInstanceMethodRequest.headers,
            );
            const expectedMethodResult = `did something successfully with someProperty of ${customContextFields.instanceInContext.someProperty}`;
            expect(result.customContextInstanceMethod).toEqual(expectedMethodResult);
            await server.stop();
        },
    );
});
