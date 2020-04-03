import { Module } from "@nestjs/common";
import { PolarisLoggerService } from "./polaris-logger.service";
import { PolarisServerConfigModule } from "../polaris-server-config/polaris-server-config.module";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";

@Module({
  imports: [PolarisServerConfigModule, PolarisLoggerService],
  providers: [PolarisServerConfigModule, PolarisLoggerService],
  exports: [PolarisLoggerService],
})
export class PolarisLoggerModule {
  constructor(private serverConfigService: PolarisServerConfigService) {
  }
}
