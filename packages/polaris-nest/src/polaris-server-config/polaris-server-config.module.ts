import { DynamicModule, Global, Module, Provider } from "@nestjs/common";
import { PolarisServerConfigService } from "./polaris-server-config.service";
import { PolarisServerOptions } from "@enigmatis/polaris-core";
import { PolarisServerOptionsToken } from "../common/constants";
import { PolarisModuleAsyncOptions } from "../common/polaris-module-options";

@Global()
@Module({})
export class PolarisServerConfigModule {
  static register(options: PolarisServerOptions): DynamicModule {
    return {
      module: PolarisServerConfigModule,
      providers: [
        { provide: PolarisServerOptionsToken, useValue: options },
        PolarisServerConfigService,
      ],
      exports: [PolarisServerConfigService],
    };
  }

  static registerAsync(options: PolarisModuleAsyncOptions): DynamicModule {
    let providers: Provider[] = [PolarisServerConfigService];
    if (options.providers) {
      providers = [...options.providers, ...providers];
    }
    providers = [this.createConfigurationProvider(options), ...providers];
    return {
      module: PolarisServerConfigModule,
      providers,
      imports: options.imports,
      exports: [PolarisServerConfigService],
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
