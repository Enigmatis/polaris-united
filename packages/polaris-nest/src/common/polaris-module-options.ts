import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface PolarisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
    useFactory: (...args: any[]) => Promise<PolarisServerOptions> | PolarisServerOptions;
    inject?: any[];
}
