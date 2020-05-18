import {
  OICD_CLAIM_UPN,
  REALITY_ID,
  REQUEST_ID,
} from "@enigmatis/polaris-common";
import axios from "axios";
import { startTestServer, stopTestServer } from "../test-server/test-server";
import * as polarisProperties from "../test-server/resources/polaris-properties.json";

beforeEach(async () => {
  await startTestServer();
});

afterEach(() => {
  return stopTestServer();
});

describe("response headers tests", () => {
  const url = `http://localhost:${polarisProperties.port}/${polarisProperties.version}/graphql`;
  const query = "{ allBooks { title } }";

  test("response headers are set", async () => {
    const result = await axios.post(url, { query });
    expect(result.headers[REQUEST_ID]).toBeDefined();
    expect(result.headers[REALITY_ID]).toBeDefined();
  });

  test("reality id is passed from the request", async () => {
    const realityId = 0;
    const headers = { "reality-id": realityId };
    const result = await axios.post(url, { query }, { headers });
    expect(result.headers[REALITY_ID]).toBe(String(realityId));
  });

  test("upn is passed from the request", async () => {
    const upn = "just some upn";
    const headers = { "oicd-claim-upn": upn };
    const result = await axios.post(url, { query }, { headers });
    expect(result.headers[OICD_CLAIM_UPN]).toBe(upn);
  });

  test("request id is passed from the request", async () => {
    const requestId = "troubles";
    const headers = { "request-id": requestId };
    const result = await axios.post(url, { query }, { headers });
    expect(result.headers[REQUEST_ID]).toBe(requestId);
  });
});
