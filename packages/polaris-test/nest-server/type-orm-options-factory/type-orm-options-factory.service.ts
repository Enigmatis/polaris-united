import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { connectionOptions } from '../../test-utils/connection-options';

@Injectable()
export class TypeOrmOptionsFactoryService implements TypeOrmOptionsFactory {
    public createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions {
        return {...connectionOptions,
            name: connectionName || process.env.SCHEMA_NAME,
            autoLoadEntities: true,
            keepConnectionAlive: true,
            entities: [__dirname + '/../dal/models/*.{ts,js}']
        };
    }
}