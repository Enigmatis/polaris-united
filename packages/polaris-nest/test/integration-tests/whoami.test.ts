import axios from "axios";
import * as polarisProperties from "../test-server/resources/polaris-properties.json";
import { startTestServer, stopTestServer } from "../test-server/test-server";

beforeEach(async () => {
  await startTestServer();
});

afterEach(async () => {
  return stopTestServer();
});

describe("whoami tests", () => {
  test("get request for whoami endpoint, returning a valid response", async () => {
    const url = `http://localhost:${polarisProperties.port}/whoami`;
    const result = await axios(url);
    expect(result.data.service).toBe(polarisProperties.name);
    expect(result.data.version).toBe(polarisProperties.version);
  });
});
