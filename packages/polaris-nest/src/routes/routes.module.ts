import { Module } from '@nestjs/common';
import { PolarisServerConfigModule } from '..';
import { RoutesService } from './routes.service';

@Module({
    imports: [PolarisServerConfigModule],
    providers: [RoutesService],
})
export class RoutesModule {}
