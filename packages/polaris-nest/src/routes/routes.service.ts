import { Injectable, Res } from "@nestjs/common";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";
import {
  ApplicationProperties,
  getConnectionForReality,
  REALITY_ID,
  SnapshotPage,
  SnapshotMetadata,
  SnapshotStatus
} from "@enigmatis/polaris-core";
import * as express from "express";

@Injectable()
export class RoutesService {
  private applicationProperties: ApplicationProperties;
  constructor(private readonly config: PolarisServerConfigService) {
    this.applicationProperties = config.getPolarisServerConfig().applicationProperties;
  }
  redirectToConfigVersion(req: express.Request) {
    return {
      url: req.url + this.applicationProperties.version + "/graphql"
    };
  }
  whoAmI() {
    return {
      service: this.applicationProperties.name,
      version: this.applicationProperties.version
    };
  }
  async snapshot(req: express.Request, @Res() res: express.Response) {
    const id = req.query.id as string;
    const realityHeader: string | string[] | undefined =
      req.headers[REALITY_ID];
    const realityId: number = realityHeader ? +realityHeader : 0;
    const snapshotRepository = getConnectionForReality(
      realityId,
      this.config.getPolarisServerConfig().supportedRealities,
      this.config.getPolarisServerConfig().connectionManager!
    ).getRepository(SnapshotPage);
    const result = await snapshotRepository.findOne({} as any, id);
    if (!result) {
      res.send({});
    } else {
      await snapshotRepository.update({} as any, id, { id });
      const responseToSend =
        result!.status !== SnapshotStatus.DONE
          ? { status: result!.status, id: result!.id }
          : result!.getData();
      res.send(responseToSend);
    }
  }
  async snapshotMetadata(req: express.Request, @Res() res: express.Response) {
    const id = req.query.id as string;
    const realityHeader: string | string[] | undefined =
      req.headers[REALITY_ID];
    const realityId: number = realityHeader ? +realityHeader : 0;
    const snapshotMetadataRepository = getConnectionForReality(
      realityId,
      this.config.getPolarisServerConfig().supportedRealities,
      this.config.getPolarisServerConfig().connectionManager!
    ).getRepository(SnapshotMetadata);
    const result = await snapshotMetadataRepository.findOne({} as any, id);
    if (result) {
      await snapshotMetadataRepository.update({} as any, id, { id });
    }
    res.send(result);
  }
}
