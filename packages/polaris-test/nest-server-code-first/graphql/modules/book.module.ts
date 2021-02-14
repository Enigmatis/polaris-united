import { PolarisConnectionInjector, TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Author } from '../../../shared-resources/entities/author';
import { Book } from '../../../shared-resources/entities/book';
import { BookResolver } from '../resolvers/book.resolver';
import { BookService } from '../services/book.service';
import { BookRepository } from '../repositories/book-repository';
import { AuthorRepository } from '../repositories/author-repository';

@Module({
    imports: [TypeOrmModule.forFeature([Book, Author, AuthorRepository, BookRepository])],
    providers: [
        BookResolver,
        BookService,
        {
            provide: 'PUB_SUB',
            useValue: new PubSub(),
        },
        BookRepository,
        PolarisConnectionInjector,
    ],
})
export class BookModule {}
