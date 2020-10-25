import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { PolarisServerOptionsToken } from '../common/constants';
import { PolarisModuleAsyncOptions } from '../common/polaris-module-options';
import { PolarisServerConfigService } from './polaris-server-config.service';

@Global()
@Module({})
export class PolarisServerConfigModule {
    public static register(options: PolarisServerOptions): DynamicModule {
        return {
            module: PolarisServerConfigModule,
            providers: [
                { provide: PolarisServerOptionsToken, useValue: options },
                PolarisServerConfigService,
            ],
            exports: [PolarisServerConfigService],
        };
    }

    public static registerAsync(options: PolarisModuleAsyncOptions): DynamicModule {
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

    private static createConfigurationProvider(options: PolarisModuleAsyncOptions): Provider {
        return {
            provide: PolarisServerOptionsToken,
            useFactory: options.useFactory,
            inject: options.inject,
        };
    }
}
