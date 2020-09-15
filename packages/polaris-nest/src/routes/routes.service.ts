import { Injectable, Res } from "@nestjs/common";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";
import {
  ApplicationProperties,
  getConnectionForReality,
  PolarisServerConfig,
  REALITY_ID,
  SnapshotMetadata,
  SnapshotPage,
  PolarisConnectionManager,
  Repository,
  SnapshotStatus
} from "@enigmatis/polaris-core";
import * as express from "express";
import {
  snapshotMetadataRoute,
  snapshotPageRoute
} from "@enigmatis/polaris-core/dist/src/server/routes/snapshot-routes";

@Injectable()
export class RoutesService {
  private applicationProperties: ApplicationProperties;
  private config: PolarisServerConfig;
  constructor(config: PolarisServerConfigService) {
    this.config = config.getPolarisServerConfig();
    this.applicationProperties = this.config.applicationProperties;
  }
  redirectToConfigVersion(req: express.Request) {
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
  async snapshot(req: express.Request, @Res() res: express.Response, version: string) {
    if (this.applicationProperties.version === version && this.config.connectionManager){
      return snapshotPageRoute(req,this.config,res);
    }
  }
  async snapshotMetadata(req: express.Request, @Res() res: express.Response, version:string) {
    if (this.applicationProperties.version === version && this.config.connectionManager) {
      return snapshotMetadataRoute(req,this.config,res);
    }
  }
}