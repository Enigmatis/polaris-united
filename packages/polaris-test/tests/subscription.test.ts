import { PolarisServerOptions } from '@enigmatis/polaris-core';
import * as polarisProperties from '../server/resources/polaris-properties.json';
import { graphQLRequest } from '../server/utils/graphql-client';
import { WebsocketClient } from '../server/utils/websocket-client';
import { createServers } from '../tests-servers-util';
import * as createBook from './jsonRequestsAndHeaders/createBook.json';
import * as subscriptionRequest from './jsonRequestsAndHeaders/subscriptionBookUpdated.json';
import * as updateBooksByTitle from './jsonRequestsAndHeaders/updateBooksByTitle.json';

const SUBSCRIPTION_ENDPOINT = `ws://localhost:${polarisProperties.port}/${polarisProperties.version}/subscription`;

let wsClient: WebsocketClient;

const subscriptionConfig: Partial<PolarisServerOptions> = {
    allowSubscription: true,
};

describe('subscription tests', () => {
    test.each(createServers(subscriptionConfig))(
        'subscribing to book updates, and receiving a message once a book was updated',
        async server => {
            await server.start();
            wsClient = new WebsocketClient(SUBSCRIPTION_ENDPOINT);
            const title = 'Book1';
            const newTitle = 'Just a Title';
            await graphQLRequest(createBook.request, {}, { title });

            await wsClient.send(subscriptionRequest.request);
            await graphQLRequest(updateBooksByTitle.request, {}, { title, newTitle });

            expect(wsClient.receivedMessages[0].bookUpdated.title).toBe(newTitle);
            await wsClient.close();
            await server.stop();
        },
    );
});
