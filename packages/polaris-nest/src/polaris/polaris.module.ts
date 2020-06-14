import { DynamicModule, Module, Provider } from "@nestjs/common";
import { RoutesModule } from "../routes/routes.module";
import { PolarisLoggerModule } from "../polaris-logger/polaris-logger.module";
import { RoutesService } from "../routes/routes.service";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";
import { GqlOptionsFactoryService } from "../polaris-gql-module-options/polaris-gql-module-options.service";
import { PolarisServerConfigModule } from "../polaris-server-config/polaris-server-config.module";
import { PolarisLoggerService } from "../polaris-logger/polaris-logger.service";
import { RoutesController } from "../routes/routes.controller";
import { PolarisServerOptions } from "@enigmatis/polaris-core";
import { PolarisServerOptionsToken } from "../common/constants";
import { PolarisModuleAsyncOptions } from "../common/polaris-module-options";
import { Type } from "@nestjs/common/interfaces/type.interface";
import { ForwardReference } from "@nestjs/common/interfaces/modules/forward-reference.interface";
import { GraphQLModule } from "../polaris-gql/polaris-gql.module";

let providers: Provider[] = [
  RoutesService,
  PolarisServerConfigService,
  PolarisLoggerService,
];
const controllers = [RoutesController];
@Module({})
export class PolarisModule {
  static register(options: PolarisServerOptions): DynamicModule {
    return {
      module: PolarisModule,
      imports: [
        PolarisServerConfigModule.register(options),
        PolarisLoggerModule,
        RoutesModule,
        GraphQLModule.forRootAsync({
          useClass: GqlOptionsFactoryService,
          imports: [PolarisServerConfigModule.register(options)],
        }),
      ],
      providers: [
        { provide: PolarisServerOptionsToken, useValue: options },
        ...providers,
      ],
      exports: [PolarisLoggerModule, PolarisServerConfigModule],
      controllers,
    };
  }

  static registerAsync(options: PolarisModuleAsyncOptions): DynamicModule {
    let imports: Array<
      Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
    > = [
      PolarisServerConfigModule.registerAsync(options),
      PolarisLoggerModule,
      RoutesModule,
      GraphQLModule.forRootAsync({
        useClass: GqlOptionsFactoryService,
        imports: [PolarisServerConfigModule.registerAsync(options)],
      }),
    ];
    if (options.providers) {
      providers = [...options.providers, ...providers];
    }
    if (options.imports) {
      imports = [...options.imports, ...imports];
    }
    return {
      module: PolarisModule,
      providers: [...providers, this.createConfigurationProvider(options)],
      imports,
      controllers,
      exports: [PolarisLoggerModule, PolarisServerConfigModule],
    };
  }

  private static createConfigurationProvider(
    options: PolarisModuleAsyncOptions
  ): Provider {
    return {
      provide: PolarisServerOptionsToken,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  }
}
