import {
  setConfiguration,
  startTestServer,
  stopTestServer,
} from "../test-server/test-server";
import { graphqlRawRequest } from "../test-server/utils/graphql-client";
import * as booksWithWarnings from "./jsonRequestsAndHeaders/queryForBooksWithWarnings.json";
import { PolarisServerOptions } from "@enigmatis/polaris-core";

describe("warnings disabled tests", () => {
  describe("shouldAddWarningsToExtensions is false", () => {
    beforeEach(async () => {
      const warningConfig: Partial<PolarisServerOptions> = {
        shouldAddWarningsToExtensions: false,
      };
      setConfiguration(warningConfig);
      await startTestServer();
    });

    afterEach(async () => {
      await stopTestServer();
    });

    it("should not return warnings in the extensions of the response", async () => {
      const result = await graphqlRawRequest(
        booksWithWarnings.request,
        booksWithWarnings.headers
      );
      expect(result.extensions.warnings).toBeUndefined();
    });
  });
});
