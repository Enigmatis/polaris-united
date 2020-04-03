import { Injectable } from "@nestjs/common";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";
import { ApplicationProperties } from "@enigmatis/polaris-core";

@Injectable()
export class RoutesService {
  private applicationProperties: ApplicationProperties;
  constructor(config: PolarisServerConfigService) {
    this.applicationProperties = config.getPolarisServerConfig().applicationProperties;
  }
  redirectToConfigVersion(req: Request) {
    return {
      url: req.url + this.applicationProperties.version + "/graphql",
    };
  }
  whoAmI() {
    return {
      service: this.applicationProperties.name,
      version: this.applicationProperties.version,
    };
  }
}
