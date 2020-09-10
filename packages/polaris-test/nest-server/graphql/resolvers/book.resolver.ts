import { PaginatedResolver } from '@enigmatis/polaris-nest';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Book } from '../../dal/models/book';
import * as BookApi from '../entities/book';
import { BookService } from '../services/book.service';

@Resolver(() => BookApi.Book)
export class BookResolver {
    constructor(private readonly bookService: BookService) {}

    @Query(returns => [BookApi.Book])
    public async allBooks(): Promise<Book[]> {
        return this.bookService.findAll();
    }
    @Query(returns => [BookApi.Book])
    public async allBooksPaginated(): Promise<PaginatedResolver<Book>> {
        return {
            getData: (startIndex?: number, pageSize?: number): Promise<Book[]> => {
                return this.bookService.findPaginated(startIndex || 0, pageSize || 10);
            },
            totalCount: (): Promise<number> => {
                return this.bookService.totalCount();
            },
        };
    }
    @Query(returns => [BookApi.Book])
    public async allBooksWithWarnings(): Promise<Book[]> {
        return this.bookService.findAllWithWarnings();
    }
    @Query(returns => [BookApi.Book])
    public async bookByTitle(@Args('title') title: string): Promise<Book[]> {
        const books = await this.bookService.booksByTitle(title);
        return books;
    }

    @Mutation(returns => [BookApi.Book])
    public async updateBooksByTitle(
        @Args('title') title: string,
        @Args('newTitle') newTitle: string,
    ): Promise<Book[] | Book> {
        return this.bookService.updateBooksByTitle(title, newTitle);
    }

    @Mutation(returns => Boolean)
    public async deleteBook(@Args('id') id: string) {
        return this.bookService.remove(id);
    }
    @Mutation(returns => BookApi.Book)
    public async createBook(
        @Args('title') title: string,
        @Args('id', { nullable: true }) id: string,
    ) {
        return this.bookService.createBook(title, id);
    }
    @Subscription(() => BookApi.Book)
    public bookUpdated() {
        return this.bookService.registerToBookUpdates();
    }
}
