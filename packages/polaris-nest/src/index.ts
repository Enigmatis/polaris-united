import { INestApplication } from "@nestjs/common";
import * as express from "express";
import * as path from "path";
export { RepositoryEntity } from "./schema/repository-entity.model";
export { PolarisModule } from "./polaris/polaris.module";

export function setApp(app: INestApplication) {
  app.use(
    "/graphql-playground-react",
    express.static(path.join(__dirname, "../../polaris-nest/static/playground"))
  );
}
