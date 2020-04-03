import { Module } from "@nestjs/common";
import { PolarisServerConfigService } from "./polaris-server-config.service";

@Module({
  imports: [PolarisServerConfigService],
  providers: [PolarisServerConfigService],
  exports: [PolarisServerConfigService],
})
export class PolarisServerConfigModule {}
