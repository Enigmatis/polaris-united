import { PolarisConnection } from '@enigmatis/polaris-core';
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { EntitiesMetadataStorage } from '@nestjs/typeorm/dist/entities-metadata.storage';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { DEFAULT_CONNECTION_NAME } from '@nestjs/typeorm/dist/typeorm.constants';
import { createTypeOrmProviders } from '@nestjs/typeorm/dist/typeorm.providers';
import { Connection, ConnectionOptions } from 'typeorm';
import { PolarisTypeOrmModuleOptions, TypeOrmCoreModule } from './typeorm-core.module';

@Module({})
export class TypeOrmModule {
    public static forRoot(options: PolarisTypeOrmModuleOptions): DynamicModule {
        return {
            module: TypeOrmModule,
            imports: [TypeOrmCoreModule.forRoot(options)],
        };
    }

    public static forFeature(
        entities: EntityClassOrSchema[],
        connection: PolarisConnection | ConnectionOptions | string = DEFAULT_CONNECTION_NAME,
    ): DynamicModule {
        const con: Connection | ConnectionOptions | string =
            connection instanceof PolarisConnection
                ? ((connection as unknown) as Connection)
                : connection;
        const providers = createTypeOrmProviders(entities, con);
        EntitiesMetadataStorage.addEntitiesByConnection(con, entities);
        return {
            module: TypeOrmModule,
            providers,
            exports: providers,
        };
    }

    public static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
        return {
            module: TypeOrmModule,
            imports: [TypeOrmCoreModule.forRootAsync(options)],
        };
    }
}
