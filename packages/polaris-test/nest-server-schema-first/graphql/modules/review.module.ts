import { TypeOrmModule } from '@enigmatis/polaris-nest';
import { Module } from '@nestjs/common';
import { Book } from '../../../shared-resources/entities/book';
import { Review } from '../../../shared-resources/entities/review';
import { ReviewService } from '../services/review.service';
import { ReviewResolver } from '../resolvers/review.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([Review, Book])],
    providers: [ReviewService, ReviewResolver],
})
export class ReviewModule {}
