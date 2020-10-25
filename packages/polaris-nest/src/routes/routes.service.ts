import {
    ApplicationProperties,
    PolarisServerConfig,
    snapshotMetadataRoute,
    snapshotPageRoute,
} from '@enigmatis/polaris-core';
import { Injectable, Res } from '@nestjs/common';
import * as express from 'express';
import { PolarisServerConfigService } from '../polaris-server-config/polaris-server-config.service';

@Injectable()
export class RoutesService {
    private applicationProperties: ApplicationProperties;
    private config: PolarisServerConfig;
    constructor(config: PolarisServerConfigService) {
        this.config = config.getPolarisServerConfig();
        this.applicationProperties = this.config.applicationProperties;
    }
    public redirectToConfigVersion(req: express.Request) {
        return {
            url: req.url + this.applicationProperties.version + '/graphql',
        };
    }
    public whoAmI() {
        return {
            service: this.applicationProperties.name,
            version: this.applicationProperties.version,
        };
    }
    public async snapshot(req: express.Request, @Res() res: express.Response, version: string) {
        if (this.applicationProperties.version === version && this.config.connectionManager) {
            return snapshotPageRoute(req, this.config, res);
        }
    }
    public async snapshotMetadata(
        req: express.Request,
        @Res() res: express.Response,
        version: string,
    ) {
        if (this.applicationProperties.version === version && this.config.connectionManager) {
            return snapshotMetadataRoute(req, this.config, res);
        }
    }
}
