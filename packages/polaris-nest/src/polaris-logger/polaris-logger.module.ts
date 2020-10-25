import { Global, Module } from '@nestjs/common';
import { PolarisServerConfigModule } from '../polaris-server-config/polaris-server-config.module';
import { PolarisLoggerService } from './polaris-logger.service';

@Global()
@Module({
    imports: [PolarisServerConfigModule],
    providers: [PolarisLoggerService],
    exports: [PolarisLoggerService],
})
export class PolarisLoggerModule {}
