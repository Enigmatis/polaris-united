import { Module } from "@nestjs/common";
import { PolarisServerConfigModule } from "../polaris-server-config/polaris-server-config.module";
import { RoutesService } from "./routes.service";

@Module({
  imports: [PolarisServerConfigModule],
  providers: [RoutesService],
})
export class RoutesModule {}
