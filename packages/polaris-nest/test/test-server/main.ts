import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setApp } from "../../src";
import { INestApplication } from "@nestjs/common";
import * as polarisProperties from "../test-server/resources/polaris-properties.json";
export let app: INestApplication = {} as INestApplication;
export async function bootstrap() {
  app = await NestFactory.create(AppModule);
  setApp(app);
  await app.listen(polarisProperties.port);
}
