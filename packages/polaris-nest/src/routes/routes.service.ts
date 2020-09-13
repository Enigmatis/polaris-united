import { Injectable, Res } from "@nestjs/common";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";
import {
  ApplicationProperties,
  getConnectionForReality,
  PolarisServerConfig,
  REALITY_ID, SnapshotMetadata,
  SnapshotPage
} from "@enigmatis/polaris-core";
import * as express from "express";
import { PolarisConnectionManager, Repository, SnapshotStatus } from "../../../polaris-typeorm/dist/src";

@Injectable()
export class RoutesService {
  private applicationProperties: ApplicationProperties;
  private config: PolarisServerConfig;
  constructor(config: PolarisServerConfigService) {
    this.config = config.getPolarisServerConfig();
    this.applicationProperties = this.config.applicationProperties;
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
  async snapshot(req: express.Request, @Res() res: express.Response, version: string) {
    if (this.applicationProperties.version === version && this.config.connectionManager){
      const id = req.query.id as string;
      const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
      const realityId: number = realityHeader ? +realityHeader : 0;
      const queryRunner = getConnectionForReality(
        realityId,
        this.config.supportedRealities as any,
        this.config.connectionManager as PolarisConnectionManager,
      ).createQueryRunner();
      const snapshotPageRepository: Repository<SnapshotPage> = queryRunner.manager.getRepository(
        SnapshotPage,
      );
      const result = await snapshotPageRepository.findOne(id);
      if (!result) {
        res.send({});
      } else {
        await snapshotPageRepository.update(id, { id });
        const responseToSend =
          result!.status !== SnapshotStatus.DONE
            ? { status: result!.status, id: result!.id }
            : result!.getData();
        res.send(responseToSend);
      }
      await queryRunner.release();
    }
  }
  async snapshotMetadata(req: express.Request, @Res() res: express.Response, version:string) {
    if (this.applicationProperties.version === version && this.config.connectionManager) {
      const id = req.query.id;
      const realityHeader: string | string[] | undefined =
        req.headers[REALITY_ID];
      const realityId: number = realityHeader ? +realityHeader : 0;
      const snapshotMetadataRepository = getConnectionForReality(
        realityId,
        this.config.supportedRealities,
        this.config.connectionManager
      ).getRepository(SnapshotMetadata);
      const result = await snapshotMetadataRepository.findOne({} as any, id);
      res.send(result?.getData());
    }
  }
}