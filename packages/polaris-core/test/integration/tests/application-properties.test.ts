import { ApplicationProperties } from '@enigmatis/polaris-common';
import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import * as allBooks from './jsonRequestsAndHeaders/allBooks.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';

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
        const titles = ['book01', 'book02'];
        await graphQLRequest(createBook.request, {}, { title: titles[0] });
        await graphQLRequest(createBook.request, {}, { title: titles[1] });
        const result: any = await graphQLRequest(allBooks.request);
        expect(result.allBooks[0].title).toEqual(titles[0]);
        expect(result.allBooks[1].title).toEqual(titles[1]);
    });
});
