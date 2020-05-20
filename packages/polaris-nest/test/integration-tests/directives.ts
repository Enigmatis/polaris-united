import {
  startTestServer,
  stopTestServer,
} from "../test-server/test-server";
import { graphQLRequest } from "../test-server/utils/graphql-client";

beforeEach(async () => {
  await startTestServer();
});

afterEach(async () => {
  return stopTestServer();
});

describe("directives tests", () => {
  it("query a field with directive, directive logic activated", async () => {
    const result = await graphQLRequest(
      `
                {
                    allBooks {
                        coverColor
                    }
                }
            `,
      {}
    );
    expect(result.allBooks[0].coverColor).toEqual("RED");
    expect(result.allBooks[1].coverColor).toEqual("ORANGE");
  });
});
