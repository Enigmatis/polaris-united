import { PolarisTypeORMInjector, TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Book } from '../../../shared-resources/entities/book';
import { Genre } from '../../../shared-resources/entities/genre';
import { GenreService } from '../services/genre.service';
import { GenreResolver } from '../resolvers/genre.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([Genre, Book])],
    providers: [GenreService, GenreResolver, PolarisTypeORMInjector],
})
export class GenreModule {}
