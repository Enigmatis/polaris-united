import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class TypeOrmOptionsFactoryService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions {
    return {
      name: connectionName,
      type: "postgres",
      url: process.env.CONNECTION_STRING,
      schema: process.env.SCHEMA_NAME,
      entities: [__dirname + "/../dal/models/*.{ts,js}"],
      dropSchema: true,
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      keepConnectionAlive: true,
    };
  }
}

//npm i sqlite3@npm:sqlite3-offline
//
// "sqlite3": "npm:sqlite3-offline@^4.3.0",
//     "sqlite3-offline": "4.3.0",
// const sqliteConnectionOptions: TypeOrmModuleOptions =
