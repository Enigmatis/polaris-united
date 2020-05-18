import { Global, Module } from "@nestjs/common";
import { PolarisLoggerService } from "./polaris-logger.service";
import { PolarisServerConfigModule } from "../polaris-server-config/polaris-server-config.module";

@Global()
@Module({
  imports: [PolarisServerConfigModule],
  providers: [PolarisLoggerService],
  exports: [PolarisLoggerService],
})
export class PolarisLoggerModule {}
