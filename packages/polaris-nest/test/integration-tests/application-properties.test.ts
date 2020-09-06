import "reflect-metadata";
import { startTestServer, stopTestServer } from "../test-server/test-server";
import { graphQLRequest } from "../test-server/utils/graphql-client";
import { ApplicationProperties } from "../../../polaris-common/src";
import * as allBooks from "./jsonRequestsAndHeaders/allBooks.json";

beforeEach(async () => {
  const applicationProperties: ApplicationProperties = {
    id: "123123",
    name: "polaris core tests"
  };
  await startTestServer({ applicationProperties });
});

afterEach(async () => {
  await stopTestServer();
});

describe("application properties tests", () => {
  test("application properties was provided without version and the default version was applied", async () => {
    const result: any = await graphQLRequest(allBooks.request);
    expect(result.allBooks).toEqual([]);
  });
});
