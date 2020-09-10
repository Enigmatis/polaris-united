import { PolarisRepository } from '@enigmatis/polaris-core';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from '../../dal/models/author';
import { Book } from '../../dal/models/book';

@Injectable()
export class DataInitializationService {
    constructor(
        @InjectRepository(Author)
        private readonly authorRepo: PolarisRepository<Author>,
        @InjectRepository(Book)
        private readonly bookRepo: PolarisRepository<Book>,
    ) {}
    public getAuthors(): Author[] {
        return [new Author('Author1', 'First'), new Author('Author2', 'Two')];
    }
    public getBooks(authors: Author[]): Book[] {
        return [
            new Book('Book1', authors[0], 'Red'),
            new Book('Book2', authors[1], 'Orange'),
            new Book('Book3', authors[0], 'Green'),
            new Book('Book4', authors[0], 'Yellow'),
            new Book('Book5', authors[1], 'Yellow'),
        ];
    }
    public async createExampleData(authors: Author[], books: Book[]) {
        const context = {
            requestHeaders: { realityId: 0 },
            returnedExtensions: {},
        } as any;
        await this.authorRepo.save(context, authors);
        await this.bookRepo.save(context, [books[0], books[1]]);
        context.requestHeaders.realityId = 3;
        delete context.returnedExtensions.globalDataVersion;
        await this.bookRepo.save(context, books[2]);
        delete context.returnedExtensions.globalDataVersion;
        await this.bookRepo.save(context, books[3]);
        books[4].setDeleted(true);
        await this.bookRepo.save(context, books[4]);
    }
    public async init() {
        const authors: Author[] = this.getAuthors();
        const books: Book[] = this.getBooks(authors);
        await this.createExampleData(authors, books);
    }
}
