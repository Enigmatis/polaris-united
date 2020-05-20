import * as polarisProperties from "../test-server/resources/polaris-properties.json";
import {
  setConfiguration,
  startTestServer,
  stopTestServer,
} from "../test-server/test-server";
import { graphQLRequest } from "../test-server/utils/graphql-client";
import { WebsocketClient } from "../test-server/utils/websocket-client";
import { PolarisServerOptions } from "@enigmatis/polaris-core";

const SUBSCRIPTION_ENDPOINT = `ws://localhost:${polarisProperties.port}/${polarisProperties.version}/subscription`;

let wsClient: WebsocketClient;

beforeEach(async () => {
  const subscriptionConfig: Partial<PolarisServerOptions> = {
    allowSubscription: true,
  };
  setConfiguration(subscriptionConfig);
  await startTestServer();
  wsClient = new WebsocketClient(SUBSCRIPTION_ENDPOINT);
  await wsClient.waitForSocketConnection();
});

afterEach(async () => {
  await wsClient.close();
  await stopTestServer();
});

describe("subscription tests", () => {
  test("subscribing to book updates, and receiving a message once a book was updated", async () => {
    const title = "Book1";
    const newTitle = "Just a Title";
    await wsClient.send(
      `
                subscription {
                    bookUpdated {
                        id
                        title
                    }
                }
            `
    );
    await graphQLRequest(
      `
                mutation($title: String!, $newTitle: String!) {
                   updateBooksByTitle(title: $title, newTitle: $newTitle) {
                        id
                        title
                    }
                }
            `,
      {},
      { title, newTitle }
    );
    expect(wsClient.receivedMessages[0].bookUpdated.title).toBe(newTitle);
  });
});
