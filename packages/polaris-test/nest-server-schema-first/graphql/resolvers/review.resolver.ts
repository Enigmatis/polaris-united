import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql';
import { ReviewService } from '../services/review.service';
import { ProfessionalReview, SimpleReview, Review } from '../../graphql';
import { Injectable, Scope } from '@nestjs/common';

@Resolver('Review')
@Injectable({ scope: Scope.REQUEST })
export class ReviewResolver {
    constructor(private readonly reviewService: ReviewService) {}

    @ResolveField()
    __resolveType(review: any) {
        if ('site' in review && review.site) {
            return 'ProfessionalReview';
        }
        return 'SimpleReview';
    }
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
