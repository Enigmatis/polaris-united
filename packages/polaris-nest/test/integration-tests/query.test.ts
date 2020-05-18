import { startTestServer, stopTestServer } from "../test-server/test-server";
import * as argsQuery from "./jsonRequestsAndHeaders/irrelevantEntities.json";
import * as simpleQuery from "./jsonRequestsAndHeaders/simpleQuery.json";
import { graphQLRequest } from "../test-server/utils/graphql-client";

beforeEach(async () => {
  await startTestServer();
});

afterEach(async () => {
  await stopTestServer();
});

describe("simple queries", () => {
  it("all entities query", async () => {
    const result = await graphQLRequest(
      simpleQuery.request,
      simpleQuery.headers
    );
    expect(result.allBooks[0].title).toEqual("Book1");
    expect(result.allBooks[1].title).toEqual("Book2");
  });

  it("query with arguments", async () => {
    const result = await graphQLRequest(argsQuery.request, argsQuery.headers);
    expect(result.bookByTitle[0].title).toEqual("Book3");
  });
});
