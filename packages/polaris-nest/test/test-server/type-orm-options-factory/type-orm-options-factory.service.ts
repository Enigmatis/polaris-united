import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class TypeOrmOptionsFactoryService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions {
    const options: TypeOrmModuleOptions = {
      name: connectionName,
      type: "postgres",
      database: "vulcan_db",
      username: "vulcan_usr@galileo-dbs",
      password: "vulcan_usr123",
      host: "galileo-dbs.postgres.database.azure.com",
      schema: "arik",
      dropSchema: true,
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      keepConnectionAlive: true,
    };
    return options;
  }
}

//npm i sqlite3@npm:sqlite3-offline
//
// "sqlite3": "npm:sqlite3-offline@^4.3.0",
//     "sqlite3-offline": "4.3.0",
// const sqliteConnectionOptions: TypeOrmModuleOptions =
