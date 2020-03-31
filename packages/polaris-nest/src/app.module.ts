import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { RecipesModule } from "./recipes/recipes.module";
import { PolarisEntitiesModule } from "./polaris-entities/polaris-entities.module";
import {
  SoftDeleteMiddleware,
  PolarisServerOptions,
  getMergedPolarisTypes,
  getMergedPolarisResolvers,
  repositoryEntityTypeDefs,
  scalarsTypeDefs,
  makeExecutablePolarisSchema,
} from "@enigmatis/polaris-core";
import { TypeOrmModule } from "./lib";
import { GraphQLSchema } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import { PolarisGraphQLLogger } from "@enigmatis/polaris-graphql-logger";
import { PolarisServerConfig } from "@enigmatis/polaris-core/dist/src/config/polaris-server-config";
import { addResolveFunctionsToSchema } from "graphql-tools";
import { print } from "graphql/language/printer";
import { mergeSchemas } from "apollo-server";
import { join } from "path";

const polarisServerConfig = {
  allowMandatoryHeaders: false,
};
const options: PolarisServerOptions = {
  typeDefs: [], // BY ANNOTATION
  resolvers: [], // BY ANNOTATION
  port: 8080, //DEFAULT IN SEED
};
const config: PolarisServerConfig = {} as any;// getPolarisServerConfigFromOptions(options);
//npm i sqlite3@npm:sqlite3-offline
const polarisGraphQLLogger = new PolarisGraphQLLogger({
  loggerLevel: "debug",
  writeToConsole: true,
});
const md = [new SoftDeleteMiddleware(polarisGraphQLLogger).getMiddleware()];

const op = {
  installSubscriptionHandlers: true,
  autoSchemaFile: true,
  playground: true,
  transformSchema: (schema: GraphQLSchema) => {
    return applyMiddleware(schema, ...md);
  },
  schemaDirectives: config.schemaDirectives,
  useGlobalPrefix: true,
};

@Module({
  imports: [
    RecipesModule,
    TypeOrmModule.forRoot({
      //   type: "postgres",
      //   database: "vulcan_db",
      //   username: "vulcan_usr@galileo-dbs",
      //   password: "vulcan_usr123",
      //   host: "galileo-dbs.postgres.database.azure.com",
      //   autoLoadEntities: true,
      //   synchronize: true,
      //   logging: true,
      //   schema: "recipes",
      // }
      type: "sqlite",
      database: ":memory:",
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    GraphQLModule.forRoot(op),
    PolarisEntitiesModule,
  ],
})
export class AppModule {}
