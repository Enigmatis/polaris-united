import { Module } from "@nestjs/common";
import { PolarisModule } from "../../src/polaris/polaris.module";
import { AuthorModule } from "./graphql/modules/author.module";
import { BookModule } from "./graphql/modules/book.module";
import { TypeOrmOptionsFactoryService } from "./type-orm-options-factory/type-orm-options-factory.service";
import { PolarisLoggerService } from "../../src/polaris-logger/polaris-logger.service";
import { PolarisLoggerModule } from "../../src/polaris-logger/polaris-logger.module";
import { TypeOrmModule } from "../../src/typeorm/typeorm.module";
import { DataInitializationModule } from "./graphql/modules/data-initialization.module";
import { createOptionsFactory } from "./polaris-server-options-factory/polaris-server-options-factory-service";

@Module({
  imports: [
    AuthorModule,
    BookModule,
    PolarisModule.registerAsync({
      useFactory: createOptionsFactory,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmOptionsFactoryService,
      inject: [PolarisLoggerService],
      imports: [PolarisLoggerModule],
    }),
    DataInitializationModule,
  ],
})
export class AppModule {}
