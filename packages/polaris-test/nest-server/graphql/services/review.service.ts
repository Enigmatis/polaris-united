import { PolarisConnection, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectConnection } from '@nestjs/typeorm';
import { Book } from '../../../shared-resources/entities/book';
import { Review } from '../../../shared-resources/entities/review';
import { TestContext } from '../../../shared-resources/context/test-context';

@Injectable({ scope: Scope.REQUEST })
export class ReviewService {
    constructor(
        private bookRepository: PolarisRepository<Book>,
        private reviewRepository: PolarisRepository<Review>,
        @InjectConnection()
        connection: PolarisConnection,
        @Inject(CONTEXT) ctx: TestContext,
    ) {
        this.bookRepository = connection.getRepository(Book, ctx);
        this.reviewRepository = connection.getRepository(Review, ctx);
    }

    public async createReview(
        description: string,
        rating: string,
        site?: string,
        name?: string,
        id?: string,
    ): Promise<Review | undefined> {
        let book;
        if (id) {
            book = await this.bookRepository.findOne({ where: { id } });
            if (book) {
                const newReview = new Review(description, rating, book, site, name);
                const reviewSaved = await this.reviewRepository.save(newReview);
                return reviewSaved instanceof Array ? reviewSaved[0] : reviewSaved;
            }
        }
        return undefined;
    }
}
