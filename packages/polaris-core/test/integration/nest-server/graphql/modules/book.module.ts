import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { TypeOrmModule } from '../../../../../../polaris-nest/src/typeorm/typeorm.module';
import { Author } from '../../dal/models/author';
import { Book } from '../../dal/models/book';
import { BookResolver } from '../resolvers/book.resolver';
import { BookService } from '../services/book.service';
import { DataInitializationModule } from './data-initialization.module';

@Module({
    imports: [TypeOrmModule.forFeature([Book, Author]), DataInitializationModule],
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
