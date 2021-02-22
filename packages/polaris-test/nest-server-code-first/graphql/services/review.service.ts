import { PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Review } from '../../../shared-resources/entities/review';
import { Book } from '../../../shared-resources/entities/book';
import { PolarisTypeORMInjector } from '@enigmatis/polaris-nest';

@Injectable({ scope: Scope.REQUEST })
export class ReviewService {
    private bookRepository: PolarisRepository<Book>;
    private reviewRepository: PolarisRepository<Review>;
    constructor(
        @Inject(PolarisTypeORMInjector)
        private readonly polarisTypeORMInjector: PolarisTypeORMInjector,
    ) {
        this.bookRepository = this.polarisTypeORMInjector.getRepository(Book);
        this.reviewRepository = this.polarisTypeORMInjector.getRepository(Review);
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
