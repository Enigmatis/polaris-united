import { PolarisGraphQLContext, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../../../shared-resources/entities/book';
import { Review } from '../../../shared-resources/entities/review';

@Injectable({ scope: Scope.REQUEST })
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: PolarisRepository<Review>,
        @InjectRepository(Book)
        private readonly bookRepository: PolarisRepository<Book>,
        @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext,
    ) {}

    public async createReview(
        description: string,
        rating: string,
        site?: string,
        name?: string,
        id?: string,
    ): Promise<Review | undefined> {
        let book;
        if (id) {
            book = await this.bookRepository.findOne(this.ctx, { where: { id } });
            if (book) {
                const newReview = new Review(description, rating, book, site, name);
                const reviewSaved = await this.reviewRepository.save(this.ctx, newReview);
                return reviewSaved instanceof Array ? reviewSaved[0] : reviewSaved;
            }
        }
        return undefined;
    }
}
