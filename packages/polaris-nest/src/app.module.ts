import { DynamicModule, Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { RecipesModule } from "./recipes/recipes.module";
import { PolarisEntitiesModule } from "./polaris-entities/polaris-entities.module";
import { TypeOrmModule } from "./lib";
import { RoutesController } from "./routes/routes.controller";
import { PolarisLoggerService } from "./polaris-logger/polaris-logger.service";
import { createGqlOptions } from "./polaris-gql-module-options/polaris-gql-module-options.service";
import { PolarisServerConfigService } from "./polaris-server-config/polaris-server-config.service";
import { TypeOrmOptionsFactoryService } from "./type-orm-options-factory/type-orm-options-factory.service";
import { PolarisLoggerModule } from "./polaris-logger/polaris-logger.module";
import { PolarisServerConfigModule } from "./polaris-server-config/polaris-server-config.module";
import { RoutesModule } from "./routes/routes.module";
import {RoutesService} from "./routes/routes.service";
import { PolarisServerOptionsModule } from './polaris-server-options/polaris-server-options.module';
import {PolarisServerOptionsService} from "./polaris-server-options/polaris-server-options.service";

@Module({
  imports: [
    RecipesModule,
    PolarisServerConfigModule,
    PolarisLoggerModule,
   //   PolarisServerOptionsModule,
    GraphQLModule.forRootAsync({
      useFactory: createGqlOptions,
      inject: [PolarisServerConfigService, PolarisLoggerService],
     imports: [PolarisServerConfigModule,PolarisLoggerModule]
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmOptionsFactoryService,
      inject: [PolarisLoggerService],
      imports: [PolarisLoggerModule],
    }),
    PolarisEntitiesModule,
    RoutesModule,
  ],
  providers: [RoutesService, PolarisServerConfigService, PolarisLoggerModule],// PolarisServerOptionsService
  controllers: [RoutesController],
})
export class AppModule {}
