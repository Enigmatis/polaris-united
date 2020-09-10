import { TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Author } from '../../dal/models/author';
import { Book } from '../../dal/models/book';
import { DataInitializationResolver } from '../resolvers/data-initialization.resolver';
import { DataInitializationService } from '../services/data-initialization.service';

@Module({
    imports: [TypeOrmModule.forFeature([Author, Book])],
    providers: [DataInitializationService, DataInitializationResolver],
})
export class DataInitializationModule {}
