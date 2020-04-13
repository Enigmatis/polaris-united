import { Inject, Injectable } from "@nestjs/common";
import { PolarisServerConfig } from "@enigmatis/polaris-core/dist/src/config/polaris-server-config";
import { getPolarisServerConfigFromOptions } from "@enigmatis/polaris-core/dist/src/server/configurations-manager";
//import { PolarisServerOptionsService } from "../polaris-server-options/polaris-server-options.service";

@Injectable()
export class PolarisServerConfigService {
  private readonly polarisServerConfig: PolarisServerConfig;

  constructor() { // optionsService: PolarisServerOptionsService)
    this.polarisServerConfig = getPolarisServerConfigFromOptions(
      {
        typeDefs: [], // BY ANNOTATION
        resolvers: [], // BY ANNOTATION
        port: 8080, //DEFAULT IN SEED
      }
      //optionsService.getPolarisServerOptions()
    );
  }

  getPolarisServerConfig(): PolarisServerConfig {
    return this.polarisServerConfig;
  }
}
