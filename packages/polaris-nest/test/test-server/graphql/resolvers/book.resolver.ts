import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { BookService } from "../services/book.service";
import { Book } from "../../dal/models/book";
import * as BookApi from "../entities/book";
import { PaginatedResolver } from "@enigmatis/polaris-core";

@Resolver((of) => BookApi.Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query((returns) => [BookApi.Book])
  async allBooks(): Promise<Book[]> {
    return this.bookService.findAll();
  }
  @Query((returns) => [BookApi.Book])
  async allBooksPaginated(): Promise<PaginatedResolver<Book>> {
    return {
      getData: (startIndex?: number, pageSize?: number): Promise<Book[]> => {
        return this.bookService.findPaginated(startIndex, pageSize);
      },
      totalCount: (): Promise<number> => {
        return this.bookService.totalCount();
      },
    };
  }
  @Query((returns) => [BookApi.Book])
  async allBooksWithWarnings(): Promise<Book[]> {
    return this.bookService.findAllWithWarnings();
  }
  @Query((returns) => [BookApi.Book])
  async bookByTitle(@Args("title") title: string): Promise<Book[]> {
    const books = await this.bookService.booksByTitle(title);
    return books;
  }

  @Mutation((returns) => [BookApi.Book])
  async updateBooksByTitle(
    @Args("title") title: string,
    @Args("newTitle") newTitle: string
  ): Promise<Book[] | Book> {
    return this.bookService.updateBooksByTitle(title, newTitle);
  }

  @Mutation((returns) => Boolean)
  async deleteBook(@Args("id") id: string) {
    return this.bookService.remove(id);
  }
  @Subscription(() => BookApi.Book)
  bookUpdated() {
    return this.bookService.registerToBookUpdates();
  }
}
