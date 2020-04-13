import { GqlModuleOptions, GqlOptionsFactory } from "@nestjs/graphql";
import { PolarisServerConfig } from "@enigmatis/polaris-core/dist/src/config/polaris-server-config";
import {
  PolarisGraphQLContext,
  ExpressContext,
  createPolarisSubscriptionsConfig,
  createPlaygroundConfig,
  createIntrospectionConfig,
  polarisFormatError,
} from "@enigmatis/polaris-core";
import {
  createPolarisContext,
  createPolarisMiddlewares,
  createPolarisPlugins,
} from "@enigmatis/polaris-core/dist/src/config/create-apollo-config-util";
import { PolarisGraphQLLogger } from "@enigmatis/polaris-graphql-logger";
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { SubscriptionServerOptions } from "apollo-server-core/src/types";
import { PlaygroundConfig } from "apollo-server";
import { GraphQLSchema } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import { PolarisLoggerService } from "../polaris-logger/polaris-logger.service";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";

export const createGqlOptions = (
  configService: PolarisServerConfigService,
  loggerService: PolarisLoggerService
): Promise<GqlModuleOptions> | GqlModuleOptions => {
  const config = configService.getPolarisServerConfig();
  const logger = loggerService.getPolarisLogger(config) as unknown as PolarisGraphQLLogger;
  console.log("config service:"+ configService);
  console.log("logger service:"+ loggerService);
  console.log("logger:"+ logger);
  const plugins: Array<
    ApolloServerPlugin | (() => ApolloServerPlugin)
  > = createPolarisPlugins(logger, config);
  const middlewares: any[] = createPolarisMiddlewares(config, logger);
  const context: (
    context: ExpressContext
  ) => PolarisGraphQLContext = createPolarisContext(logger, config);
  const subscriptions:
    | Partial<SubscriptionServerOptions>
    | string
    | false = createPolarisSubscriptionsConfig(config);
  const playground: PlaygroundConfig = createPlaygroundConfig(config);
  const introspection: boolean | undefined = createIntrospectionConfig(config);
  const x= {
    installSubscriptionHandlers: config.allowSubscription,
    autoSchemaFile: true,
    playground,
    plugins,
    context,
    subscriptions,
    introspection,
    formatError: polarisFormatError,
    transformSchema: (schema: GraphQLSchema) => {
      return applyMiddleware(schema, ...middlewares);
    },
    path: config.applicationProperties.version,
    schemaDirectives: config.schemaDirectives,
  };
  console.log(x);
  return x;
};
