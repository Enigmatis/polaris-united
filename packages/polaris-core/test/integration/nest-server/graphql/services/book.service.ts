import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Like, PolarisGraphQLContext, PolarisRepository } from '../../../../../src';
import { PubSubEngine } from 'graphql-subscriptions';
import { Book } from '../../dal/models/book';

const BOOK_UPDATED = 'BOOK_UPDATED';

@Injectable({ scope: Scope.REQUEST })
export class BookService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: PolarisRepository<Book>,
        @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext,
        @Inject('PUB_SUB') private pubSub: PubSubEngine,
    ) {}

    public async findAll(): Promise<any[]> {
        return this.bookRepository.find(this.ctx, { relations: ['author'] });
    }

    public async findAllWithWarnings(): Promise<Book[]> {
        this.ctx.returnedExtensions.warnings = ['warning 1', 'warning 2'];
        return this.bookRepository.find(this.ctx, { relations: ['author'] });
    }

    public async booksByTitle(title: string): Promise<Book[]> {
        return this.bookRepository.find(this.ctx, {
            where: { title: Like(`%${title}%`) },
            relations: ['author'],
        });
    }

    public async updateBooksByTitle(title: string, newTitle: string): Promise<Book[] | Book> {
        const result: Book[] = await this.bookRepository.find(this.ctx, {
            where: { title: Like(`%${title}%`) },
        });
        result.forEach(book => this.pubSub.publish(BOOK_UPDATED, { bookUpdated: book }));

        result.forEach(book => (book.title = newTitle));
        return this.bookRepository.save(this.ctx, result);
    }

    public async remove(id: string): Promise<boolean> {
        const result: DeleteResult = await this.bookRepository.delete(this.ctx, id);
        return (
            result &&
            result.affected !== null &&
            result.affected !== undefined &&
            result.affected > 0
        );
    }

    public registerToBookUpdates() {
        return this.pubSub.asyncIterator([BOOK_UPDATED]);
    }
    public async findPaginated(startIndex: number, pageSize: number): Promise<Book[]> {
        return this.bookRepository.find(this.ctx, {
            skip: startIndex,
            take: pageSize,
        });
    }

    public async totalCount(): Promise<number> {
        return this.bookRepository.count(this.ctx);
    }
}
