import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { BookService } from "../services/book.service";
import { Book } from "../../dal/models/book";
import * as BookApi from "../entities/book";

@Resolver((of) => BookApi.Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query((returns) => [BookApi.Book])
  async allBooks(): Promise<Book[]> {
    return this.bookService.findAll();
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
    console.log("registered!!!!!!!!!!!!!!!!!")
    return this.bookService.registerToBookUpdates();
  }
}
