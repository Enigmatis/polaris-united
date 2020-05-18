import * as simpleQuery from "./jsonRequestsAndHeaders/includeLinkedOperDisabled.json";
import * as irrelevantEntities from "./jsonRequestsAndHeaders/irrelevantEntities.json";
import * as multipleIrrelevantEntities from "./jsonRequestsAndHeaders/multipleQueries.json";
import { startTestServer, stopTestServer } from "../test-server/test-server";
import {
  graphqlRawRequest,
  graphQLRequest,
} from "../test-server/utils/graphql-client";

beforeEach(async () => {
  await startTestServer();
});

afterEach(() => {
  return stopTestServer();
});

describe("irrelevant entities in response", () => {
  it("should have irrelevant entities if the response is partial", async () => {
    const result = await graphqlRawRequest(
      irrelevantEntities.request,
      irrelevantEntities.headers
    );
    const irrelevantId = (
      await graphQLRequest(simpleQuery.request, simpleQuery.headers)
    ).allBooks[1].id;
    expect(result.extensions.irrelevantEntities.bookByTitle).toContain(
      irrelevantId
    );
  });

  it("should not get irrelevant entities if no data version in headers", async () => {
    const result = await graphqlRawRequest(irrelevantEntities.request, {
      "reality-id": 3,
    });
    expect(result.extensions.irrelevantEntities).toBeUndefined();
  });

  it("should place irrelevant response in the specific field info", async () => {
    const result = await graphqlRawRequest(
      multipleIrrelevantEntities.request,
      multipleIrrelevantEntities.headers
    );
    expect(result.extensions.irrelevantEntities.a).toBeDefined();
    expect(result.extensions.irrelevantEntities.b).toBeDefined();
    expect(result.extensions.irrelevantEntities.a).toContain(
      result.data.b[0].id
    );
    expect(result.extensions.irrelevantEntities.b).toContain(
      result.data.a[0].id
    );
  });
});
