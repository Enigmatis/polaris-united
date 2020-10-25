import { Controller, Get, Redirect, Req, Res } from '@nestjs/common';
import * as express from 'express';
import { RoutesService } from './routes.service';

@Controller()
export class RoutesController {
    constructor(private readonly routesService: RoutesService) {}

    @Get('/whoami')
    public whoAmI() {
        return this.routesService.whoAmI();
    }

    @Get()
    @Redirect('/')
    public redirectToConfigurationVersion(@Req() req: express.Request) {
        return this.routesService.redirectToConfigVersion(req);
    }
    @Get('*/snapshot')
    public snapshot(@Req() req: express.Request, @Res() res: express.Response) {
        const version = req.url.substring(1, req.url.indexOf('/snapshot'));
        return this.routesService.snapshot(req, res, version);
    }
    @Get('*/snapshot/metadata')
    public snapshotMetadata(@Req() req: express.Request, @Res() res: express.Response) {
        const version = req.url.substring(1, req.url.indexOf('/snapshot/metadata'));
        return this.routesService.snapshotMetadata(req, res, version);
    }
}
