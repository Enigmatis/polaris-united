import { getPolarisConnectionManager } from "@enigmatis/polaris-typeorm";
import { bootstrap, app } from "./main";
import { graphQLRequest } from "./utils/graphql-client";
import * as initData from "../integration-tests/jsonRequestsAndHeaders/initData.json";
import { PolarisServerOptions } from "@enigmatis/polaris-core";
import { createOptions } from "./polaris-server-options-factory/polaris-server-options-factory-service";
import * as optionsModule from "./polaris-server-options-factory/polaris-server-options-factory-service";

export async function startTestServer(): Promise<void> {
  await bootstrap();
  if (getPolarisConnectionManager().connections.length > 0) {
    let manager = getPolarisConnectionManager();
    for (let connection of manager.connections) {
      await connection.close();
    }
    Object.assign(manager, { connections: [] });
  }
  await graphQLRequest(initData.request, initData.headers);
}

export async function stopTestServer(): Promise<void> {
  if (getPolarisConnectionManager().connections.length > 0) {
    let manager = getPolarisConnectionManager();
    for (let connection of manager.connections) {
      await connection.close();
    }
    Object.assign(manager, { connections: [] });
  }
  await app.close();
}

export function setConfiguration(config: Partial<PolarisServerOptions>) {
  let polarisServerOptions: PolarisServerOptions = createOptions();
  polarisServerOptions = { ...polarisServerOptions, ...config };
  jest
    .spyOn(optionsModule, "createOptions")
    .mockImplementation(() => polarisServerOptions);
}
