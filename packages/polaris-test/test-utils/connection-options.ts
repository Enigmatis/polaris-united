import { ConnectionOptions } from "@enigmatis/polaris-core";

export const connectionOptions: ConnectionOptions = {
  name: process.env.SCHEMA_NAME,
  type: 'postgres',
  url: process.env.CONNECTION_STRING || '',
  synchronize: true,
  dropSchema: true,
  logging: true,
  schema: process.env.SCHEMA_NAME,
  extra: { max: 10 },
};