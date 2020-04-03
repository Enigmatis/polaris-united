import { Injectable } from "@nestjs/common";
import { TypeOrmOptionsFactory } from "../lib/interfaces";

@Injectable()
export class TypeOrmOptionsFactoryService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(connectionName?: string): any {
    return {
      type: "sqlite",
      database: ":memory:",
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      schema: "recipes",
    };
  }
}

//npm i sqlite3@npm:sqlite3-offline
//
// const sqliteConnectionOptions: TypeOrmModuleOptions =

