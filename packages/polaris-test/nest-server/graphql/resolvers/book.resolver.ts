import { PaginatedResolver } from '@enigmatis/polaris-nest';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Book } from '../../../shared-resources/entities/book';
import * as BookApi from '../entities/book';
import { BookService } from '../services/book.service';

@Resolver(() => BookApi.Book)
export class BookResolver {
    constructor(private readonly bookService: BookService) {}

    @Query(() => [BookApi.Book])
    public async allBooks(): Promise<Book[]> {
        return this.bookService.findAll();
    }
    @Query(() => [BookApi.Book])
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
    @Query(() => [BookApi.Book])
    public async allBooksWithWarnings(): Promise<Book[]> {
        return this.bookService.findAllWithWarnings();
    }
    @Query(() => [BookApi.Book])
    public async bookByTitle(@Args('title') title: string): Promise<Book[]> {
        return this.bookService.booksByTitle(title);
    }

    @Mutation(() => [BookApi.Book])
    public async updateBooksByTitle(
        @Args('title') title: string,
        @Args('newTitle') newTitle: string,
    ): Promise<Book[] | Book> {
        return this.bookService.updateBooksByTitle(title, newTitle);
    }

    @Mutation(() => Boolean)
    public async deleteBook(@Args('id') id: string) {
        return this.bookService.remove(id);
    }
    @Mutation(() => BookApi.Book)
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
