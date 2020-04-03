import {Controller, Get, Inject, Redirect, Req} from "@nestjs/common";
import { RoutesService } from "./routes.service";

@Controller()
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {
  }
  @Get("/whoami")
  whoAmI() {
    return this.routesService.whoAmI();
  }
  @Get()
  @Redirect("/")
  redirectToConfigurationVersion(@Req() req) {
    return this.routesService.redirectToConfigVersion(req);
  }
}
