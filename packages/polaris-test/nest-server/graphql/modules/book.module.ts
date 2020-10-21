import {TypeOrmModule} from '@enigmatis/polaris-nest';
import {Module} from '@nestjs/common';
import {PubSub} from 'graphql-subscriptions';
import {Author} from '../../../shared-resources/entities/author';
import {Book} from '../../../shared-resources/entities/book';
import {BookResolver} from '../resolvers/book.resolver';
import {BookService} from '../services/book.service';

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
