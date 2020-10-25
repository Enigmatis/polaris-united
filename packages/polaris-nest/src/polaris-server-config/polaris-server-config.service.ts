import {
    getPolarisServerConfigFromOptions,
    PolarisServerConfig,
    PolarisServerOptions,
} from '@enigmatis/polaris-core';
import { Inject, Injectable } from '@nestjs/common';
import { PolarisServerOptionsToken } from '../common/constants';

@Injectable()
export class PolarisServerConfigService {
    private readonly polarisServerConfig: PolarisServerConfig;

    constructor(
        @Inject(PolarisServerOptionsToken)
        options: PolarisServerOptions,
    ) {
        this.polarisServerConfig = getPolarisServerConfigFromOptions(options);
    }

    public getPolarisServerConfig(): PolarisServerConfig {
        return this.polarisServerConfig;
    }
}
