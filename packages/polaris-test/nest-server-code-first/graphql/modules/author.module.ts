import {
    PolarisConnectionInjector,
    PolarisLoggerModule,
    PolarisLoggerService,
    TypeOrmModule,
} from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Author } from '../../../shared-resources/entities/author';
import { AuthorRepository } from '../repositories/author-repository';
import { AuthorResolver } from '../resolvers/author.resolver';
import { AuthorService } from '../services/author.service';

@Module({
    imports: [TypeOrmModule.forFeature([Author, AuthorRepository]), PolarisLoggerModule],
    providers: [
        AuthorResolver,
        AuthorService,
        AuthorRepository,
        PolarisLoggerService,
        PolarisConnectionInjector,
    ],
})
export class AuthorModule {}
