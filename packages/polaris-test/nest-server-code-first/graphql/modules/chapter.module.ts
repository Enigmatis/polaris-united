import { PolarisConnectionInjector, TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Author } from '../../../shared-resources/entities/author';
import { Book } from '../../../shared-resources/entities/book';
import { Chapter } from '../../../shared-resources/entities/chapter';
import { ChapterResolver } from '../resolvers/chapter.resolver';
import { ChapterService } from '../services/chapter.service';
import { ChapterRepository } from '../repositories/chapter-repository';
import { BookRepository } from '../repositories/book-repository';
import { AuthorRepository } from '../repositories/author-repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Chapter,
            Book,
            Author,
            ChapterRepository,
            BookRepository,
            AuthorRepository,
        ]),
    ],
    providers: [ChapterResolver, ChapterRepository, ChapterService, PolarisConnectionInjector],
})
export class ChapterModule {}
