import { ApplicationProperties } from '@enigmatis/polaris-common';
import { PolarisServer } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest, graphQLRequest } from '../server/utils/graphql-client';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
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
        const titles = ['book01', 'book02'];
        await graphqlRawRequest(createBook.request, undefined, {
            title: titles[0],
        });
        await graphqlRawRequest(createBook.request, undefined, {
            title: titles[1],
        });
        const result: any = await graphQLRequest(allBooks.request, undefined);
        expect(result.allBooks[0].title).toEqual(titles[0]);
        expect(result.allBooks[1].title).toEqual(titles[1]);
    });
});
