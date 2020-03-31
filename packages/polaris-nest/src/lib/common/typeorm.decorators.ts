import { Inject } from "@nestjs/common";
import { ConnectionOptions } from "typeorm";
import { DEFAULT_CONNECTION_NAME } from "../typeorm.constants";
import {
  getConnectionToken,
  getEntityManagerToken,
  getRepositoryToken,
} from "./typeorm.utils";
import { PolarisConnection } from "@enigmatis/polaris-typeorm";

export const InjectRepository = (
  entity: Function,
  connection: string = DEFAULT_CONNECTION_NAME
) => Inject(getRepositoryToken(entity, connection));

export const InjectConnection: (
  connection?: PolarisConnection | ConnectionOptions | string
) => ParameterDecorator = (
  connection?: PolarisConnection | ConnectionOptions | string
) => Inject(getConnectionToken(connection));

export const InjectEntityManager: (
  connection?: PolarisConnection | ConnectionOptions | string
) => ParameterDecorator = (
  connection?: PolarisConnection | ConnectionOptions | string
) => Inject(getEntityManagerToken(connection));
