import { DynamicModule, Inject, Module } from "@nestjs/common";
import { ConnectionOptions } from "typeorm";
import { EntitiesMetadataStorage } from "./entities-metadata.storage";
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "./interfaces/typeorm-options.interface";
import { TypeOrmCoreModule } from "./typeorm-core.module";
import { DEFAULT_CONNECTION_NAME } from "./typeorm.constants";
import { createTypeOrmProviders } from "./typeorm.providers";
import { PolarisConnection } from "@enigmatis/polaris-typeorm";
import { AbstractPolarisLogger } from "@enigmatis/polaris-logs";
import { PolarisLoggerService } from "../polaris-logger/polaris-logger.service";

@Module({})
export class TypeOrmModule {
  static forRoot(options?: TypeOrmModuleOptions): DynamicModule {
    return {
      module: TypeOrmModule,
      imports: [TypeOrmCoreModule.forRoot(options)],
    };
  }

  static forFeature(
    entities: Function[] = [],
    connection:
      | PolarisConnection
      | ConnectionOptions
      | string = DEFAULT_CONNECTION_NAME
  ): DynamicModule {
    const providers = createTypeOrmProviders(entities, connection);
    EntitiesMetadataStorage.addEntitiesByConnection(connection, entities);
    return {
      module: TypeOrmModule,
      providers: providers,
      exports: providers,
    };
  }

  static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
    return {
      module: TypeOrmModule,
      imports: [TypeOrmCoreModule.forRootAsync(options)],
    };
  }
}
