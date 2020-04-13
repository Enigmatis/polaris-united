import { Module } from "@nestjs/common";
import { PolarisLoggerService } from "./polaris-logger.service";
import { PolarisServerConfigModule } from "../polaris-server-config/polaris-server-config.module";

@Module({
  imports: [PolarisServerConfigModule],
  providers: [PolarisLoggerService],
  exports: [PolarisLoggerService],
})
export class PolarisLoggerModule {
}
