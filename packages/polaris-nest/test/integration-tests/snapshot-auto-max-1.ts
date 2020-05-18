import { startTestServer, stopTestServer } from "../test-server/test-server";
import { graphqlRawRequest } from "../test-server/utils/graphql-client";
import * as paginatedQuery from "./jsonRequestsAndHeaders/paginatedQuery.json";

beforeEach(async () => {
  await startTestServer();
  // {
  // snapshotConfig: {
  //     autoSnapshot: true,
  //     maxPageSize: 1,
  //     snapshotCleaningInterval: 60,
  //     secondsToBeOutdated: 60,
  //     entitiesAmountPerFetch: 50,
  // },
  // }
});
afterEach(async () => {
  await stopTestServer();
});

describe("snapshot pagination tests with auto enabled", () => {
  describe("max page size is 1", () => {
    describe("snap request is false", () => {
      it("should paginated anyway", async () => {
        const paginatedResult = await graphqlRawRequest(
          paginatedQuery.request,
          {
            ...paginatedQuery.headers,
            "snap-request": false,
          }
        );
        const pageIds = paginatedResult.extensions.snapResponse.pagesIds;
        expect(pageIds.length).toBe(2);
      });

      it("should paginated according to minimal snap page size provided", async () => {
        const paginatedResult = await graphqlRawRequest(
          paginatedQuery.request,
          {
            ...paginatedQuery.headers,
            "snap-request": false,
            "snap-page-size": 10,
          }
        );
        const pageIds = paginatedResult.extensions.snapResponse.pagesIds;
        expect(pageIds.length).toBe(2);
      });
    });
  });
});
