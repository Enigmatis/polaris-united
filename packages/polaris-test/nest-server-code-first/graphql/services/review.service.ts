import { PolarisConnection, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { Review } from '../../../shared-resources/entities/review';
import { TestContext } from '../../../shared-resources/context/test-context';
import { Book } from '../../../shared-resources/entities/book';
import { PolarisConnectionInjector } from '@enigmatis/polaris-nest';

@Injectable({ scope: Scope.REQUEST })
export class ReviewService {
    private bookRepository: PolarisRepository<Book>;
    private reviewRepository: PolarisRepository<Review>;
    private connection: PolarisConnection;
    constructor(
        @Inject(PolarisConnectionInjector)
        private readonly polarisConnectionInjector: PolarisConnectionInjector,
        @Inject(CONTEXT) ctx: TestContext,
    ) {
        this.connection = this.polarisConnectionInjector.getConnection();
        this.bookRepository = this.connection.getRepository(Book, ctx);
        this.reviewRepository = this.connection.getRepository(Review, ctx);
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
