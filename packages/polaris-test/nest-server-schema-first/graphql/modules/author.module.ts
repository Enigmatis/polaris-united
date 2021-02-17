import {
    PolarisTypeORMInjector,
    PolarisLoggerModule,
    PolarisLoggerService,
    TypeOrmModule,
} from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Author } from '../../../shared-resources/entities/author';
import { AuthorResolver } from '../resolvers/author.resolver';
import { AuthorService } from '../services/author.service';

@Module({
    imports: [TypeOrmModule.forFeature([Author]), PolarisLoggerModule],
    providers: [AuthorResolver, AuthorService, PolarisLoggerService, PolarisTypeORMInjector],
})
export class AuthorModule {}
