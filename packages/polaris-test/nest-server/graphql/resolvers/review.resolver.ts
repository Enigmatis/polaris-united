import { Args, Mutation, Resolver } from '@nestjs/graphql';
import * as ReviewApi from '../entities/review';
import { ReviewService } from '../services/review.service';
import { ReviewKind } from '../entities/review-kind';

@Resolver(() => ReviewApi.Review)
export class ReviewResolver {
    constructor(private readonly reviewService: ReviewService) {}

    @Mutation(() => ReviewApi.Review)
    public async createReview(
        @Args('description') description: string,
        @Args('rating') rating: string,
        @Args('bookId') bookId: string,
        @Args('reviewKind') reviewKind: ReviewKind,
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
