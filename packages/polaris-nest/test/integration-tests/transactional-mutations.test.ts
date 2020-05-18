import { startTestServer, stopTestServer } from "../test-server/test-server";
import {
  graphqlRawRequest,
  graphQLRequest,
} from "../test-server/utils/graphql-client";
import * as multipleMutationsWithBrokenOne from "./jsonRequestsAndHeaders/multipleMutationsWithBrokenOne.json";
import * as simpleQuery from "./jsonRequestsAndHeaders/simpleQuery.json";

describe("transactional mutations enabled integration tests", () => {
  beforeEach(async () => {
    await startTestServer();
  });

  afterEach(async () => {
    await stopTestServer();
  });

  it("execute multiple mutations in one request and one of the mutations is broken, the data version wasn't changed", async () => {
    let dataVersionBeforeUpdate;
    try {
      dataVersionBeforeUpdate = (
        await graphqlRawRequest(simpleQuery.request, simpleQuery.headers)
      ).extensions.globalDataVersion;
      await graphQLRequest(
        multipleMutationsWithBrokenOne.request,
        undefined,
        multipleMutationsWithBrokenOne.variables
      );
    } catch (err) {
      const dataVersionAfterUpdate = (
        await graphqlRawRequest(simpleQuery.request, simpleQuery.headers)
      ).extensions.globalDataVersion;
      expect(dataVersionAfterUpdate).toEqual(dataVersionBeforeUpdate);
    }
  });

  it("execute multiple mutations in one request and one of the mutations is broken, the data in db wasn't changed", async () => {
    try {
      await graphQLRequest(
        multipleMutationsWithBrokenOne.request,
        undefined,
        multipleMutationsWithBrokenOne.variables
      );
    } catch (err) {
      const result = await graphqlRawRequest(
        multipleMutationsWithBrokenOne.dataValidateRequest,
        undefined,
        multipleMutationsWithBrokenOne.variables
      );
      expect(result.data.a.length).toEqual(0);
      expect(result.data.b.length).toEqual(0);
    }
  });
});
