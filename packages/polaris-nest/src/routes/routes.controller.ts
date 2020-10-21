import {Controller, Get, Redirect, Req, Res} from '@nestjs/common';
import {RoutesService} from './routes.service';
import * as express from 'express';

@Controller()
export class RoutesController {
    constructor(private readonly routesService: RoutesService) {
    }

    @Get('/whoami')
    whoAmI() {
        return this.routesService.whoAmI();
    }

    @Get()
    @Redirect('/')
    redirectToConfigurationVersion(@Req() req: express.Request) {
        return this.routesService.redirectToConfigVersion(req);
    }
    @Get('*/snapshot')
    snapshot(@Req() req: express.Request, @Res() res: express.Response) {
        const version = req.url.substring(1, req.url.indexOf('/snapshot'));
        return this.routesService.snapshot(req, res, version);
    }
    @Get('*/snapshot/metadata')
    snapshotMetadata(@Req() req: express.Request, @Res() res: express.Response) {
        const version = req.url.substring(1, req.url.indexOf('/snapshot/metadata'));
        return this.routesService.snapshotMetadata(req, res, version);
    }
}
