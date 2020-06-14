import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { defer } from "rxjs";
import { ConnectionOptions } from "typeorm";
import {
  generateString,
  getConnectionName,
  getConnectionToken,
  getEntityManagerToken,
  handleRetry,
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from "@nestjs/typeorm";
import {
  createPolarisConnection,
  PolarisConnection,
  PolarisConnectionManager,
} from "@enigmatis/polaris-core";
import { PolarisLogger } from "@enigmatis/polaris-logs";
import {
  DEFAULT_CONNECTION_NAME,
  TYPEORM_MODULE_ID,
  TYPEORM_MODULE_OPTIONS,
} from "@nestjs/typeorm/dist/typeorm.constants";
import { EntitiesMetadataStorage } from "@nestjs/typeorm/dist/entities-metadata.storage";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";

export type PolarisTypeOrmModuleOptions = {
  /**
   * Number of times to retry connecting
   * Default: 10
   */
  retryAttempts?: number;
  /**
   * Delay between connection retry attempts (ms)
   * Default: 3000
   */
  retryDelay?: number;
  /**
   * If `true`, entities will be loaded automatically.
   */
  autoLoadEntities?: boolean;
  /**
   * If `true`, connection will not be closed on application shutdown.
   */
  keepConnectionAlive?: boolean;

  connectionManager: PolarisConnectionManager;

  logger: PolarisLogger;
} & Partial<ConnectionOptions>;

@Global()
@Module({})
export class TypeOrmCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(TYPEORM_MODULE_OPTIONS)
    private readonly options: TypeOrmModuleOptions,
    private readonly moduleRef: ModuleRef
  ) {}

  static forRoot(options: PolarisTypeOrmModuleOptions): DynamicModule {
    const typeOrmModuleOptions = {
      provide: TYPEORM_MODULE_OPTIONS,
      useValue: options,
    };
    const connectionProvider = {
      provide: getConnectionToken(options as ConnectionOptions) as string,
      useFactory: async () =>
        await this.createConnectionFactory(
          options,
          options.connectionManager,
          options.logger
        ),
    };
    const entityManagerProvider = this.createEntityManagerProvider(
      options as ConnectionOptions
    );
    return {
      module: TypeOrmCoreModule,
      providers: [
        entityManagerProvider,
        connectionProvider,
        typeOrmModuleOptions,
      ],
      exports: [entityManagerProvider, connectionProvider],
    };
  }

  static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(
        (options as unknown) as ConnectionOptions
      ) as string,
      useFactory: async (
        typeOrmOptions: TypeOrmModuleOptions,
        polarisServerConfigService: PolarisServerConfigService
      ) => {
        if (options.name) {
          return await this.createConnectionFactory(
            {
              ...typeOrmOptions,
              name: options.name,
            },
            polarisServerConfigService.getPolarisServerConfig()
              .connectionManager,
            polarisServerConfigService.getPolarisServerConfig()
              .logger as PolarisLogger
          );
        }
        return await this.createConnectionFactory(
          typeOrmOptions,
          polarisServerConfigService.getPolarisServerConfig().connectionManager,
          polarisServerConfigService.getPolarisServerConfig()
            .logger as PolarisLogger
        );
      },
      inject: [TYPEORM_MODULE_OPTIONS, ...options.inject],
    };
    const entityManagerProvider = {
      provide: getEntityManagerToken(
        (options as unknown) as ConnectionOptions
      ) as string,
      useFactory: (connection: PolarisConnection) => connection.manager,
      inject: [getConnectionToken((options as unknown) as ConnectionOptions)],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: TypeOrmCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        entityManagerProvider,
        connectionProvider,
        {
          provide: TYPEORM_MODULE_ID,
          useValue: generateString(),
        },
      ],
      exports: [entityManagerProvider, connectionProvider],
    };
  }

  async onApplicationShutdown() {
    if (this.options.keepConnectionAlive) {
      return;
    }
    const connection = this.moduleRef.get<PolarisConnection>(
      getConnectionToken(this.options as ConnectionOptions) as Type<
        PolarisConnection
      >
    );
    connection && (await connection.close());
  }

  private static createAsyncProviders(
    options: TypeOrmModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<TypeOrmOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: TypeOrmModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TYPEORM_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<TypeOrmOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<TypeOrmOptionsFactory>,
    ];
    return {
      provide: TYPEORM_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TypeOrmOptionsFactory) =>
        await optionsFactory.createTypeOrmOptions(options.name),
      inject,
    };
  }

  private static createEntityManagerProvider(
    options: ConnectionOptions
  ): Provider {
    return {
      provide: getEntityManagerToken(options) as string,
      useFactory: (connection: PolarisConnection) => connection.manager,
      inject: [getConnectionToken(options)],
    };
  }

  private static async createConnectionFactory(
    options: TypeOrmModuleOptions,
    manager: PolarisConnectionManager,
    polarisLogger: PolarisLogger
  ): Promise<PolarisConnection> {
    try {
      if (options.keepConnectionAlive) {
        const connectionName = getConnectionName(options as ConnectionOptions);
        if (manager.has(connectionName)) {
          const connection = manager.get(connectionName);
          if (connection.isConnected) {
            return connection;
          }
        }
      }
    } catch {}
    return await defer(() => {
      if (!options.type) {
        return createPolarisConnection(
          options as ConnectionOptions,
          polarisLogger as any
        );
      }
      if (!options.autoLoadEntities) {
        return createPolarisConnection(
          options as ConnectionOptions,
          polarisLogger as any
        );
      }

      const connectionToken = options.name || DEFAULT_CONNECTION_NAME;
      let entities = options.entities;
      if (entities) {
        entities = entities.concat(
          EntitiesMetadataStorage.getEntitiesByConnection(connectionToken)
        );
      } else {
        entities = EntitiesMetadataStorage.getEntitiesByConnection(
          connectionToken
        );
      }
      return createPolarisConnection(
        {
          ...options,
          entities,
        } as ConnectionOptions,
        polarisLogger as any
      );
    })
      .pipe(handleRetry(options.retryAttempts, options.retryDelay))
      .toPromise();
  }
}
