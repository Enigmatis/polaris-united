import { Inject, Injectable } from "@nestjs/common";
import { PolarisServerConfig } from "@enigmatis/polaris-core/dist/src/config/polaris-server-config";
import { getPolarisServerConfigFromOptions } from "@enigmatis/polaris-core/dist/src/server/configurations-manager";
import { PolarisServerOptionsToken } from "../common/constants";
import { PolarisServerOptions } from "@enigmatis/polaris-core";

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
