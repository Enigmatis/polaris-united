import { TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Author } from '../../dal/models/author';
import { Book } from '../../dal/models/book';
import { BookResolver } from '../resolvers/book.resolver';
import { BookService } from '../services/book.service';

@Module({
    imports: [TypeOrmModule.forFeature([Book, Author])],
    providers: [
        BookResolver,
        BookService,
        {
            provide: 'PUB_SUB',
            useValue: new PubSub(),
        },
    ],
})
export class BookModule {}
