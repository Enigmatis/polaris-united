import { PolarisConnectionInjector, TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Book } from '../../../shared-resources/entities/book';
import { Review } from '../../../shared-resources/entities/review';
import { ReviewService } from '../services/review.service';
import { ReviewResolver } from '../resolvers/review.resolver';
import { ReviewRepository } from '../repositories/review-repository';
import { BookRepository } from '../repositories/book-repository';

@Module({
    imports: [TypeOrmModule.forFeature([Review, Book, ReviewRepository, BookRepository])],
    providers: [ReviewService, ReviewRepository, ReviewResolver, PolarisConnectionInjector],
})
export class ReviewModule {}
