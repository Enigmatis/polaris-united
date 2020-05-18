import * as includeLinkedOperDisabled from "./jsonRequestsAndHeaders/includeLinkedOperDisabled.json";
import * as includeLinkedOperEnabled from "./jsonRequestsAndHeaders/includeLinkedOperEnabled.json";
import * as mutation from "./jsonRequestsAndHeaders/mutation.json";
import { startTestServer, stopTestServer } from "../test-server/test-server";
import { graphQLRequest } from "../test-server/utils/graphql-client";

beforeEach(async () => {
  await startTestServer();
});

afterEach(() => {
  return stopTestServer();
});

describe("reality is specified in the headers", () => {
  it("should set reality of the entity from the header", async () => {
    const result = await graphQLRequest(
      mutation.request,
      { "reality-id": 3 },
      {
        firstName: "Amos",
        lastName: "Oz",
      }
    );

    expect(result.createAuthor.realityId).toEqual(3);
  });

  it("should filter entities for the specific reality", async () => {
    const result = await graphQLRequest(
      includeLinkedOperDisabled.request,
      includeLinkedOperDisabled.headers
    );
    result.allBooks.forEach((book: { realityId: number }) => {
      expect(book.realityId).toEqual(3);
    });
  });

  describe("include linked operational entities", () => {
    it("should link operational entities if set to true", async () => {
      const result = await graphQLRequest(
        includeLinkedOperEnabled.request,
        includeLinkedOperEnabled.headers
      );

      result.allBooks.forEach(
        (book: { realityId: number; author: { realityId: number } }) => {
          expect(book.realityId).toBe(3);
          expect(book.author.realityId).toBe(0);
        }
      );
    });

    it("should filter operational entities if set to false", async () => {
      const result = await graphQLRequest(
        includeLinkedOperDisabled.request,
        includeLinkedOperDisabled.headers
      );

      result.allBooks.forEach((book: { author: any }) => {
        expect(book.author).toBeNull();
      });
    });
  });
});
