import {
    DeleteResult,
    Edge,
    Like,
    PageConnection,
    PolarisConnection,
    PolarisRepository,
} from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { PubSubEngine } from 'graphql-subscriptions';
import { Author } from '../../../shared-resources/entities/author';
import { Book } from '../../../shared-resources/entities/book';
import { OnlinePagingInput, PolarisConnectionInjector } from '@enigmatis/polaris-nest';
import { TestContext } from '../../../shared-resources/context/test-context';

const BOOK_UPDATED = 'BOOK_UPDATED';

@Injectable({ scope: Scope.REQUEST })
export class BookService {
    private bookRepository: PolarisRepository<Book>;
    private authorRepository: PolarisRepository<Author>;
    private connection: PolarisConnection;
    constructor(
        @Inject(CONTEXT) private readonly ctx: TestContext,
        @Inject(PolarisConnectionInjector)
        private readonly polarisConnectionInjector: PolarisConnectionInjector,
        @Inject('PUB_SUB') private pubSub: PubSubEngine,
    ) {
        this.connection = this.polarisConnectionInjector.getConnection();
        this.bookRepository = this.connection.getRepository(Book, ctx);
        this.authorRepository = this.connection.getRepository(Author, ctx);
    }

    public async findAll(): Promise<any[]> {
        return this.bookRepository.find({ relations: ['author', 'reviews'] });
    }

    public async findAllWithWarnings(): Promise<Book[]> {
        this.ctx.returnedExtensions.warnings = ['warning 1', 'warning 2'];
        return this.bookRepository.find({ relations: ['author'] });
    }

    public async booksByTitle(title: string): Promise<Book[]> {
        return this.bookRepository.find({
            where: { title: Like(`%${title}%`) },
            relations: ['author'],
        });
    }

    public async bookById(id: string): Promise<Book | undefined> {
        return this.bookRepository.findOne(id);
    }

    public async onlinePaginatedBooks(
        pagingArgs: OnlinePagingInput,
    ): Promise<PageConnection<Book> | undefined> {
        let books = await this.bookRepository.find();
        books.sort((book1, book2) => (book1.getId() > book2.getId() ? 1 : -1));
        const copyOfBooks = Array(...books);
        if (pagingArgs.after) {
            books = books.filter((book) => book.getId() > pagingArgs.after);
        }
        if (pagingArgs.before) {
            books = books.filter((book) => book.getId() < pagingArgs.before);
        }
        if (pagingArgs.first) {
            books = books.slice(0, Math.min(books.length, Number(pagingArgs.first)));
        } else if (pagingArgs.last) {
            books = books.slice(Math.max(0, books.length - Number(pagingArgs.last)), books.length);
        }
        const edges: Edge<Book>[] = [];
        books.forEach((book) => {
            edges.push({ node: book, cursor: book.getId() });
        });
        return {
            pageInfo: {
                startCursor: books[0].getId(),
                endCursor: books[books.length - 1].getId(),
                hasNextPage: copyOfBooks.indexOf(books[books.length - 1]) + 1 < copyOfBooks.length,
                hasPreviousPage: copyOfBooks.indexOf(books[0]) > 0,
            },
            edges,
        };
    }

    public async updateBooksByTitle(title: string, newTitle: string): Promise<Book[] | Book> {
        const result: Book[] = await this.bookRepository.find({
            where: { title: Like(`%${title}%`) },
        });
        result.forEach((book) => this.pubSub.publish(BOOK_UPDATED, { bookUpdated: book }));

        result.forEach((book) => (book.title = newTitle));
        return this.bookRepository.save(result);
    }
    public async createBook(title: string, id?: string): Promise<Book[] | Book> {
        let author;
        if (id) {
            author = await this.authorRepository.findOne({ where: { id } });
        }
        const newBook = new Book(title, author);
        const bookSaved = await this.bookRepository.save(newBook);
        return bookSaved instanceof Array ? bookSaved[0] : bookSaved;
    }

    public async remove(id: string): Promise<boolean> {
        const result: DeleteResult = await this.bookRepository.delete(id);
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
        return this.bookRepository.find({
            skip: startIndex,
            take: pageSize,
        });
    }

    public async totalCount(): Promise<number> {
        return this.bookRepository.count();
    }
}
