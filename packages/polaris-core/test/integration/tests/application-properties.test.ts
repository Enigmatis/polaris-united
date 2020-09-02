import { ApplicationProperties } from '@enigmatis/polaris-common';
import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';

let polarisServer: PolarisServer;

beforeEach(async () => {
    const applicationProperties: ApplicationProperties = {
        id: '123123',
        name: 'polaris core tests',
    };
    polarisServer = await startTestServer({ applicationProperties });
});

afterEach(() => {
    return stopTestServer(polarisServer);
});

describe('application properties tests', () => {
    test('application properties was provided without version and the default version was applied', async () => {
        const result: any = await graphQLRequest(allBooks.request);
        expect(result.allBooks).toEqual([]);
    });
});
