import { PolarisConnectionInjector, TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Author } from '../../../shared-resources/entities/author';
import { Book } from '../../../shared-resources/entities/book';
import { Chapter } from '../../../shared-resources/entities/chapter';
import { ChapterResolver } from '../resolvers/chapter.resolver';
import { ChapterService } from '../services/chapter.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Chapter,
            Book,
            Author,
        ]),
    ],
    providers: [ChapterResolver, ChapterService, PolarisConnectionInjector],
})
export class ChapterModule {}
