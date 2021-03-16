import {
    EntityFilter,
    OnlinePagingInput,
    PageConnection,
    PolarisGraphQLContext,
    SnapshotPaginatedResolver,
} from '@enigmatis/polaris-nest';
import {
    Args,
    CONTEXT,
    Mutation,
    Parent,
    Query,
    ResolveField,
    Resolver,
    Subscription,
} from '@nestjs/graphql';
import { Book } from '../../../shared-resources/entities/book';
import { BookService } from '../services/book.service';
import { Chapter } from '../../../shared-resources/entities/chapter';
import { getDataLoader, getPolarisConnectionManager } from '@enigmatis/polaris-core';
import { Inject } from '@nestjs/common';

@Resolver('Book')
export class BookResolver {
    constructor(
        private readonly bookService: BookService,
        @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext,
    ) {}

    @Query()
    public async allBooks(): Promise<Book[]> {
        return this.bookService.findAll();
    }

    @ResolveField('chapters')
    public async chapters(@Parent() book: Book): Promise<Chapter[] | undefined> {
        if (book && book.chaptersIds) {
            const dataLoader = getDataLoader(Chapter.name, this.ctx, Chapter.prototype);
            if (dataLoader) {
                return dataLoader.loadMany(book.chaptersIds);
            }
        }
        return undefined;
    }
    @Query()
    public async allBooksPaginatedWithException(): Promise<SnapshotPaginatedResolver<Book>> {
        return {
            getData: (startIndex?: number, pageSize?: number): Promise<Book[]> => {
                if (startIndex && startIndex >= 25) {
                    this.bookService.findAllWithWarnings();
                    throw new Error('all books paginated error');
                }
                return this.bookService.findPaginated(startIndex || 0, pageSize || 10);
            },
            totalCount: (): Promise<number> => {
                return this.bookService.totalCount();
            },
        };
    }
    @Query()
    public async allBooksPaginated(): Promise<SnapshotPaginatedResolver<Book>> {
        return {
            getData: (startIndex?: number, pageSize?: number): Promise<Book[]> => {
                return this.bookService.findPaginated(startIndex || 0, pageSize || 10);
            },
            totalCount: (): Promise<number> => {
                return this.bookService.totalCount();
            },
        };
    }
    @Query()
    public async allBooksWithWarnings(): Promise<Book[]> {
        return this.bookService.findAllWithWarnings();
    }
    @Query()
    public async bookByTitle(@Args('title') title: string): Promise<Book[]> {
        return this.bookService.booksByTitle(title);
    }
    @Query()
    public async bookById(@Args('id') id: string): Promise<Book | undefined> {
        return this.bookService.bookById(id);
    }
    @Query()
    public async onlinePaginatedBooks(
        @Args('pagingArgs') pagingArgs: OnlinePagingInput,
    ): Promise<PageConnection<Book> | undefined> {
        return this.bookService.onlinePaginatedBooks(pagingArgs);
    }
    @Query()
    public async bookByDate(@Args('filter') filter: EntityFilter): Promise<Book[]> {
        return this.bookService.findAll();
    }
    @Query(() => Boolean)
    public async isThereTransactionActive(): Promise<boolean> {
        const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
        return connection.entityManagers.size > 1;
    }

    @Mutation()
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
    @Mutation()
    public async createBook(
        @Args('title') title: string,
        @Args('authorId', { nullable: true }) authorId: string,
    ) {
        return this.bookService.createBook(title, authorId);
    }
    @Mutation(() => Boolean)
    public async createManyBooksSimultaneously() {
        await Promise.all([this.bookService.createManyBooks(), this.bookService.createManyBooks()]);
        return true;
    }
    @Subscription()
    public bookUpdated() {
        return this.bookService.registerToBookUpdates();
    }
}
