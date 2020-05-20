import {Controller, Get, Redirect, Req, Res} from "@nestjs/common";
import { RoutesService } from "./routes.service";
import * as express from 'express';

@Controller()
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}
  @Get("/whoami")
  whoAmI() {
    return this.routesService.whoAmI();
  }
  @Get()
  @Redirect("/")
  redirectToConfigurationVersion(@Req() req) {
    return this.routesService.redirectToConfigVersion(req);
  }
  @Get()
  @Redirect("/snapshot")
  snapshot(@Req() req:express.Request, @Res() res:express.Response) {
    return this.routesService.snapshot(req, res);
  }
}
