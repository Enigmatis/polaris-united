import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ReviewService } from '../services/review.service';

@Resolver()
export class ReviewResolver {
    constructor(private readonly reviewService: ReviewService) {}

    @Mutation()
    public async createReview(
        @Args('description') description: string,
        @Args('rating') rating: string,
        @Args('bookId') bookId: string,
        @Args('reviewKind') reviewKind: any,
    ) {
        return this.reviewService.createReview(
            description,
            rating,
            reviewKind.site,
            reviewKind.name,
            bookId,
        );
    }
}
