import { PolarisConnectionInjector, TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Author } from '../../../shared-resources/entities/author';
import { Book } from '../../../shared-resources/entities/book';
import { PenService } from '../services/pen.service';
import { PenResolver } from '../resolvers/pen.reslover';
import { Pen } from '../../../shared-resources/entities/pen';
import { PenRepository } from '../repositories/pen-repository';
import { BookRepository } from '../repositories/book-repository';
import { AuthorRepository } from '../repositories/author-repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Pen,
            Book,
            Author,
            PenRepository,
            BookRepository,
            AuthorRepository,
        ]),
    ],
    providers: [PenResolver, PenRepository, PenService, PolarisConnectionInjector],
})
export class PenModule {}
