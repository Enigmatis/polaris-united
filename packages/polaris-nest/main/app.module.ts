import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { RecipesModule } from "./recipes/recipes.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PolarisEntitiesModule } from "./polaris-entities/polaris-entities.module";
import {
  ExpressContext,
  PolarisGraphQLContext,
  REALITY_ID,
  REQUESTING_SYS,
  OICD_CLAIM_UPN,
  REQUEST_ID,
  Reality,
  DATA_VERSION,
  INCLUDE_LINKED_OPER,
  REQUESTING_SYS_NAME,
} from "@enigmatis/polaris-core";
import uuid from "uuid";

const polarisServerConfig = {
  allowMandatoryHeaders: false,
};

@Module({
  imports: [
    RecipesModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      database: "vulcan_db",
      username: "vulcan_usr@galileo-dbs",
      password: "vulcan_usr123",
      host: "galileo-dbs.postgres.database.azure.com",
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      schema: "recipes",
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: "schema.gql",
      playground: true,
      context: (context: ExpressContext): PolarisGraphQLContext => {
        const { req, connection } = context;
        const headers = req ? req.headers : connection?.context;
        const body = req ? req.body : connection;

        if (
          polarisServerConfig.allowMandatoryHeaders &&
          (headers[REALITY_ID] === undefined ||
            headers[REQUESTING_SYS] === undefined)
        ) {
          const error = new Error("Mandatory headers were not set!");
          this.polarisLogger.error(error.message);
          throw error;
        }

        const requestId = headers[REQUEST_ID] ;//|| uuid();
        const upn = headers[OICD_CLAIM_UPN];
        const realityId = +headers[REALITY_ID] || 0;

        //
        // const supportedRealities = this.getSupportedRealities();
        // const reality: Reality | undefined = supportedRealities.getReality(
        //   realityId
        // );
        // if (!reality) {
        //   const error = new Error("Requested reality is not supported!");
        //   this.polarisLogger.error(error.message);
        //   throw error;
        // }

        const baseContext = {
          reality: { name: "0", type: "0", id: 0 },
          requestHeaders: {
            upn,
            requestId,
            realityId,
            dataVersion: +headers[DATA_VERSION],
            includeLinkedOper: headers[INCLUDE_LINKED_OPER] === "true",
            requestingSystemId: headers[REQUESTING_SYS],
            requestingSystemName: headers[REQUESTING_SYS_NAME],
          },
          responseHeaders: {
            upn,
            requestId,
            realityId,
          },
          clientIp: req?.ip,
          request: {
            query: body.query,
            operationName: body.operationName,
            variables: body.variables,
          },
          returnedExtensions: {} as any,
        };

        // if (this.polarisServerConfig.customContext) {
        //   const customContext = this.polarisServerConfig.customContext(context);
        //   return merge(customContext, baseContext);
        // } else {
        return baseContext;
        // }
      },
    }),
    PolarisEntitiesModule,
  ],
})
export class AppModule {}
