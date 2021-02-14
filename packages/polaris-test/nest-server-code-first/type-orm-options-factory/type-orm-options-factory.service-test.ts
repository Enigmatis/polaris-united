import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { connectionOptionsRon } from '../../shared-resources/connection-options';

@Injectable()
export class TypeOrmOptionsFactoryServiceRon implements TypeOrmOptionsFactory {
    public createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions {
        return {
            ...connectionOptionsRon,
            name: 'ron',
            autoLoadEntities: true,
            keepConnectionAlive: true,
        };
    }
}
