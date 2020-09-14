import { Global, Module } from '@nestjs/common';
import { PolarisLoggerService } from './polaris-logger.service';
import { PolarisServerConfigModule } from "..";

@Global()
@Module({
    imports: [PolarisServerConfigModule],
    providers: [PolarisLoggerService],
    exports: [PolarisLoggerService],
})
export class PolarisLoggerModule {}
