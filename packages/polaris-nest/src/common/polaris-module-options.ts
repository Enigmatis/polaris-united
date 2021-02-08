import { ModuleMetadata } from '@nestjs/common/interfaces';
import { PolarisCoreOptions, PolarisNestSchemaFirstOptions } from '@enigmatis/polaris-core';

export interface PolarisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
    useFactory: (
        ...args: any[]
    ) =>
        | Promise<PolarisCoreOptions>
        | PolarisCoreOptions
        | Promise<PolarisNestSchemaFirstOptions>
        | PolarisNestSchemaFirstOptions;
    inject?: any[];
}
