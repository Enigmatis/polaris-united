import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { PolarisServerConfigService } from './polaris-server-config.service';
import { PolarisCoreOptions } from '@enigmatis/polaris-core';
import { PolarisCoreOptionsToken } from '../common/constants';
import { PolarisModuleAsyncOptions } from '../common/polaris-module-options';

@Global()
@Module({})
export class PolarisServerConfigModule {
    static register(options: PolarisCoreOptions): DynamicModule {
        return {
            module: PolarisServerConfigModule,
            providers: [
                { provide: PolarisCoreOptionsToken, useValue: options },
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

    private static createConfigurationProvider(options: PolarisModuleAsyncOptions): Provider {
        return {
            provide: PolarisCoreOptionsToken,
            useFactory: options.useFactory,
            inject: options.inject,
        };
    }
}
