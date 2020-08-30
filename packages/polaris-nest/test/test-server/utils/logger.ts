import {
  LoggerConfiguration,
  PolarisGraphQLLogger,
  LoggerLevel,
} from "@enigmatis/polaris-core";

export const loggerConfig: LoggerConfiguration = {
  loggerLevel: LoggerLevel.ERROR,
  writeToConsole: true,
  writeFullMessageToConsole: false,
};

const applicationLogProperties = {
  id: "example",
  name: "example",
  component: "repo",
  environment: "dev",
  version: "1",
};

export const polarisGraphQLLogger = new PolarisGraphQLLogger(
  loggerConfig,
  applicationLogProperties
);
