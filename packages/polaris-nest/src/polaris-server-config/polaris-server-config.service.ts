import { Inject, Injectable } from "@nestjs/common";
import { PolarisServerOptionsToken } from "../common/constants";
import { PolarisServerOptions, PolarisServerConfig, getPolarisServerConfigFromOptions } from "@enigmatis/polaris-core";

@Injectable()
export class PolarisServerConfigService {
  private readonly polarisServerConfig: PolarisServerConfig;

  constructor(
    @Inject(PolarisServerOptionsToken)
    options: PolarisServerOptions
  ) {
    this.polarisServerConfig = getPolarisServerConfigFromOptions(options);
  }

  getPolarisServerConfig(): PolarisServerConfig {
    return this.polarisServerConfig;
  }
}
