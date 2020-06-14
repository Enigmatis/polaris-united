import { DynamicModule, Module } from "@nestjs/common";
import { Connection, ConnectionOptions } from "typeorm";
import { PolarisConnection } from "@enigmatis/polaris-typeorm";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import {
  PolarisTypeOrmModuleOptions,
  TypeOrmCoreModule,
} from "./typeorm-core.module";
import { DEFAULT_CONNECTION_NAME } from "@nestjs/typeorm/dist/typeorm.constants";
import { createTypeOrmProviders } from "@nestjs/typeorm/dist/typeorm.providers";
import { EntitiesMetadataStorage } from "@nestjs/typeorm/dist/entities-metadata.storage";

@Module({})
export class TypeOrmModule {
  static forRoot(options?: PolarisTypeOrmModuleOptions): DynamicModule {
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
    const con: Connection | ConnectionOptions | string =
      connection instanceof PolarisConnection
        ? ((connection as unknown) as Connection)
        : connection;
    const providers = createTypeOrmProviders(entities, con);
    EntitiesMetadataStorage.addEntitiesByConnection(con, entities);
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
