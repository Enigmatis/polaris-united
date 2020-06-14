import { Inject, Module } from "@nestjs/common";
import {
  DynamicModule,
  OnModuleInit,
  Provider,
} from "@nestjs/common/interfaces";
import { loadPackage } from "@nestjs/common/utils/load-package.util";
import { ApplicationConfig, HttpAdapterHost } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { ApolloServerBase } from "apollo-server-core";
import { printSchema } from "graphql";
import { GraphQLAstExplorer } from "@nestjs/graphql/dist/graphql-ast.explorer";
import { GraphQLSchemaBuilder } from "@nestjs/graphql/dist/graphql-schema.builder";
import { GraphQLSchemaHost } from "@nestjs/graphql/dist/graphql-schema.host";
import { GraphQLTypesLoader } from "@nestjs/graphql/dist/graphql-types.loader";
import {
  GRAPHQL_MODULE_ID,
  GRAPHQL_MODULE_OPTIONS,
} from "@nestjs/graphql/dist/graphql.constants";
import { GraphQLFactory } from "@nestjs/graphql/dist/graphql.factory";
import {
  GqlModuleAsyncOptions,
  GqlModuleOptions,
  GqlOptionsFactory,
} from "@nestjs/graphql/dist/interfaces/gql-module-options.interface";
import { GraphQLSchemaBuilderModule } from "@nestjs/graphql/dist/schema-builder/schema-builder.module";
import {
  PluginsExplorerService,
  ResolversExplorerService,
  ScalarsExplorerService,
} from "@nestjs/graphql/dist/services";
import {
  extend,
  generateString,
  mergeDefaults,
  normalizeRoutePath,
} from "@nestjs/graphql/dist/utils";
import {
  initSnapshotGraphQLOptions,
  PolarisGraphQLLogger,
} from "@enigmatis/polaris-core";
import { ApolloServer } from "apollo-server";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";
import { PolarisServerConfig } from "@enigmatis/polaris-core/dist/src/config/polaris-server-config";

@Module({
  imports: [GraphQLSchemaBuilderModule],
  providers: [
    GraphQLFactory,
    MetadataScanner,
    ResolversExplorerService,
    ScalarsExplorerService,
    PluginsExplorerService,
    GraphQLAstExplorer,
    GraphQLTypesLoader,
    GraphQLSchemaBuilder,
    GraphQLSchemaHost,
  ],
  exports: [GraphQLTypesLoader, GraphQLAstExplorer],
})
export class GraphQLModule implements OnModuleInit {
  protected apolloServer: ApolloServerBase;
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(GRAPHQL_MODULE_OPTIONS) private readonly options: GqlModuleOptions,
    private readonly graphqlFactory: GraphQLFactory,
    private readonly graphqlTypesLoader: GraphQLTypesLoader,
    private readonly applicationConfig: ApplicationConfig,
    private readonly configService: PolarisServerConfigService
  ) {}

  static forRoot(options: GqlModuleOptions = {}): DynamicModule {
    options = mergeDefaults(options);
    return {
      module: GraphQLModule,
      providers: [
        {
          provide: GRAPHQL_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: GqlModuleAsyncOptions): DynamicModule {
    return {
      module: GraphQLModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: GRAPHQL_MODULE_ID,
          useValue: generateString(),
        },
      ],
    };
  }

  private static createAsyncProviders(
    options: GqlModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: GqlModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: GRAPHQL_MODULE_OPTIONS,
        useFactory: async (...args: any[]) =>
          mergeDefaults(await options.useFactory(...args)),
        inject: options.inject || [],
      };
    }
    return {
      provide: GRAPHQL_MODULE_OPTIONS,
      useFactory: async (optionsFactory: GqlOptionsFactory) =>
        mergeDefaults(await optionsFactory.createGqlOptions()),
      inject: [options.useExisting || options.useClass],
    };
  }

  async onModuleInit() {
    if (!this.httpAdapterHost) {
      return;
    }
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    if (!httpAdapter) {
      return;
    }
    const typeDefs =
      (await this.graphqlTypesLoader.mergeTypesByPaths(
        this.options.typePaths
      )) || [];

    const mergedTypeDefs = extend(typeDefs, this.options.typeDefs);
    const apolloOptions = await this.graphqlFactory.mergeOptions({
      ...this.options,
      typeDefs: mergedTypeDefs,
    });

    if (this.options.definitions && this.options.definitions.path) {
      await this.graphqlFactory.generateDefinitions(
        printSchema(apolloOptions.schema as any),
        this.options
      );
    }

    this.registerGqlServer(apolloOptions);

    const config: PolarisServerConfig = this.configService.getPolarisServerConfig();
    const logger: PolarisGraphQLLogger = (config.logger as unknown) as PolarisGraphQLLogger;
    initSnapshotGraphQLOptions(
      logger,
      config,
      this.apolloServer as ApolloServer,
      apolloOptions.schema,
      config.connectionManager
    );
    if (this.options.installSubscriptionHandlers) {
      this.apolloServer.installSubscriptionHandlers(
        httpAdapter.getHttpServer()
      );
    }
  }

  private registerGqlServer(apolloOptions: GqlModuleOptions) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const platformName = httpAdapter.getType();

    if (platformName === "express") {
      this.registerExpress(apolloOptions);
    } else if (platformName === "fastify") {
      this.registerFastify(apolloOptions);
    } else {
      throw new Error(`No support for current HttpAdapter: ${platformName}`);
    }
  }

  private registerExpress(apolloOptions: GqlModuleOptions) {
    const { ApolloServer } = loadPackage(
      "apollo-server-express",
      "GraphQLModule",
      () => require("apollo-server-express")
    );
    const path = this.getNormalizedPath(apolloOptions);
    const {
      disableHealthCheck,
      onHealthCheck,
      cors,
      bodyParserConfig,
    } = this.options;

    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const app = httpAdapter.getInstance();
    const apolloServer = new ApolloServer(apolloOptions);

    apolloServer.applyMiddleware({
      app,
      path,
      disableHealthCheck,
      onHealthCheck,
      cors,
      bodyParserConfig,
    });

    this.apolloServer = apolloServer;
  }

  private registerFastify(apolloOptions: GqlModuleOptions) {
    const { ApolloServer } = loadPackage(
      "apollo-server-fastify",
      "GraphQLModule",
      () => require("apollo-server-fastify")
    );

    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const app = httpAdapter.getInstance();
    const path = this.getNormalizedPath(apolloOptions);

    const apolloServer = new ApolloServer(apolloOptions as any);
    const {
      disableHealthCheck,
      onHealthCheck,
      cors,
      bodyParserConfig,
    } = this.options;
    app.register(
      apolloServer.createHandler({
        disableHealthCheck,
        onHealthCheck,
        cors,
        bodyParserConfig,
        path,
      })
    );

    this.apolloServer = apolloServer;
  }

  private getNormalizedPath(apolloOptions: GqlModuleOptions): string {
    const prefix = this.applicationConfig.getGlobalPrefix();
    const useGlobalPrefix = prefix && this.options.useGlobalPrefix;
    const gqlOptionsPath = normalizeRoutePath(apolloOptions.path);
    return useGlobalPrefix
      ? normalizeRoutePath(prefix) + gqlOptionsPath
      : gqlOptionsPath;
  }
}
