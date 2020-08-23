import { PolarisServer } from '../../../src';
import * as customContextFields from '../server/constants/custom-context-fields.json';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as customHeadersRequest from './jsonRequestsAndHeaders/authorsByFirstNameFromCustomHeader.json';
import * as createAuthor from './jsonRequestsAndHeaders/createAuthor.json';
import * as customContextCustomFieldRequest from './jsonRequestsAndHeaders/customContextCustomField.json';
import * as customContextInstanceMethodRequest from './jsonRequestsAndHeaders/customContextInstanceMethod.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    polarisServer = await startTestServer();
});

afterEach(async () => {
    await stopTestServer(polarisServer);
});

describe('custom context tests', () => {
    test('querying author by custom header in the custom context', async () => {
        const firstName = 'Author1';
        await graphQLRequest(createAuthor.request, {}, { firstName });
        const result: any = await graphQLRequest(
            customHeadersRequest.query,
            customHeadersRequest.headers,
        );

        expect(result.authorsByFirstNameFromCustomHeader[0].firstName).toEqual(firstName);
        expect(result.authorsByFirstNameFromCustomHeader[0].realityId).toEqual(0);
    });

    test('querying custom field in the custom context', async () => {
        const result: any = await graphQLRequest(
            customContextCustomFieldRequest.query,
            customContextCustomFieldRequest.headers,
        );

        expect(result.customContextCustomField).toEqual(customContextFields.customField);
    });

    test('querying method of a TestClassInContext instance in the custom context', async () => {
        const result: any = await graphQLRequest(
            customContextInstanceMethodRequest.query,
            customContextInstanceMethodRequest.headers,
        );
        const expectedMethodResult = `did something successfully with someProperty of ${customContextFields.instanceInContext.someProperty}`;

        expect(result.customContextInstanceMethod).toEqual(expectedMethodResult);
    });
});
