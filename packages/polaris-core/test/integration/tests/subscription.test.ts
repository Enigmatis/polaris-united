import { PolarisServer, PolarisServerOptions } from '../../../src';
import * as polarisProperties from '../server/resources/polaris-properties.json';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphQLRequest } from '../server/utils/graphql-client';
import { WebsocketClient } from '../server/utils/websocket-client';
import * as bookUpdated from './jsonRequestsAndHeaders/bookUpdated.json';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as updateBooksByTitle from './jsonRequestsAndHeaders/updateBooksByTitle.json';

const SUBSCRIPTION_ENDPOINT = `ws://localhost:${polarisProperties.port}/${polarisProperties.version}/subscription`;

let polarisServer: PolarisServer;
let wsClient: WebsocketClient;

beforeEach(async () => {
    const subscriptionConfig: Partial<PolarisServerOptions> = {
        allowSubscription: true,
    };
    polarisServer = await startTestServer(subscriptionConfig);
    wsClient = new WebsocketClient(SUBSCRIPTION_ENDPOINT);
});

afterEach(async () => {
    await wsClient.close();
    await stopTestServer(polarisServer);
});

describe('subscription tests', () => {
    test('subscribing to book updates, and receiving a message once a book was updated', async () => {
        const title = 'Book1';
        await graphQLRequest(createBook.request, {}, { title });
        const newTitle = 'Just a Title';

        await wsClient.send(bookUpdated.request);
        await graphQLRequest(updateBooksByTitle.request, {}, { title, newTitle });

        expect(wsClient.receivedMessages[0].bookUpdated.title).toBe(newTitle);
    });
});
