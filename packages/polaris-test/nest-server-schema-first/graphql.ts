/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class DateRangeFilter {
    gt?: string;
    gte?: string;
    lt?: string;
    lte?: string;
}

export class EntityFilter {
    creationTime?: DateRangeFilter;
    lastUpdateTime?: DateRangeFilter;
}

export class OnlinePagingInput {
    first?: number;
    last?: number;
    before?: string;
    after?: string;
}

export class ReviewKind {
    site?: string;
    name?: string;
}

export interface RepositoryEntity {
    id: string;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
}

export interface Review {
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
    rating: number;
    description: string;
    book: Book;
}

export class PageInfo {
    __typename?: 'PageInfo';
    startCursor?: string;
    endCursor?: string;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract allBooks(): Book[] | Promise<Book[]>;

    abstract authors(): Author[] | Promise<Author[]>;

    abstract allBooksPaginatedWithException(): Book[] | Promise<Book[]>;

    abstract allBooksPaginated(): Book[] | Promise<Book[]>;

    abstract allBooksWithWarnings(): Book[] | Promise<Book[]>;

    abstract authorById(id: string): Author | Promise<Author>;

    abstract bookById(id: string): Book | Promise<Book>;

    abstract bookByTitle(title: string): Book[] | Promise<Book[]>;

    abstract authorsByFirstName(name: string): Author[] | Promise<Author[]>;

    abstract authorsByFirstNameFromCustomHeader(): Author[] | Promise<Author[]>;

    abstract customContextCustomField(): number | Promise<number>;

    abstract customContextInstanceMethod(): string | Promise<string>;

    abstract permissionsField(): string | Promise<string>;

    abstract permissionsFieldWithHeader(): string | Promise<string>;

    abstract onlinePaginatedBooks(pagingArgs: OnlinePagingInput): BookConnection | Promise<BookConnection>;

    abstract bookByDate(filter?: EntityFilter): Book[] | Promise<Book[]>;

    abstract onlinePaginatedAuthorsWithLeftJoin(): Author[] | Promise<Author[]>;

    abstract isThereTransactionActive(): boolean | Promise<boolean>;

    abstract onlinePaginatedAuthorsWithInnerJoin(): Author[] | Promise<Author[]>;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract createAuthor(firstName: string, lastName?: string): Author | Promise<Author>;

    abstract createBook(title: string, authorId?: string): Book | Promise<Book>;

    abstract createPen(color: string, id?: string): Pen | Promise<Pen>;

    abstract createChapter(number: number, bookId?: string): Chapter | Promise<Chapter>;

    abstract createReview(description: string, rating: string, bookId: string, reviewKind: ReviewKind): Review | Promise<Review>;

    abstract createGenre(name: string, bookId?: string): Genre | Promise<Genre>;

    abstract createOneToOneEntity(name: string, bookId?: string, genreId?: string): OneToOneEntity | Promise<OneToOneEntity>;

    abstract updateBooksByTitle(title: string, newTitle: string): Book[] | Promise<Book[]>;

    abstract deleteBook(id: string): boolean | Promise<boolean>;

    abstract deleteAuthor(id: string): boolean | Promise<boolean>;

    abstract fail(): boolean | Promise<boolean>;

    abstract createManyAuthors(): boolean | Promise<boolean>;

    abstract createManyBooksSimultaneously(): boolean | Promise<boolean>;
}

export abstract class ISubscription {
    __typename?: 'ISubscription';

    abstract bookUpdated(): Book | Promise<Book>;
}

export class Book implements RepositoryEntity {
    __typename?: 'Book';
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
    title?: string;
    author?: Author;
    chapters?: Chapter[];
    reviews?: Review[];
    genres?: Genre[];
    oneToOneEntity?: OneToOneEntity;
}

export class Genre implements RepositoryEntity {
    __typename?: 'Genre';
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
    name: string;
    books?: Book[];
    oneToOneEntity?: OneToOneEntity;
}

export class OneToOneEntity implements RepositoryEntity {
    __typename?: 'OneToOneEntity';
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
    name: string;
    book?: Book;
    genre?: Genre;
}

export class ProfessionalReview implements Review {
    __typename?: 'ProfessionalReview';
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
    rating: number;
    description: string;
    book: Book;
    site: string;
}

export class SimpleReview implements Review {
    __typename?: 'SimpleReview';
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
    rating: number;
    description: string;
    book: Book;
    name: string;
}

export class Pen implements RepositoryEntity {
    __typename?: 'Pen';
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
    color?: string;
    author?: Author;
}

export class Chapter implements RepositoryEntity {
    __typename?: 'Chapter';
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
    number: number;
    book?: Book;
}

export class Author implements RepositoryEntity {
    __typename?: 'Author';
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: DateTime;
    lastUpdatedBy?: string;
    lastUpdateTime?: DateTime;
    realityId: number;
    dataVersion: BigInt;
    firstName?: string;
    lastName?: string;
    books?: Book[];
    pens?: Pen[];
    country?: string;
    deprecatedField?: string;
}

export class BookEdge {
    __typename?: 'BookEdge';
    node?: Book;
    cursor?: string;
}

export class BookConnection {
    __typename?: 'BookConnection';
    pageInfo?: PageInfo;
    edges?: BookEdge[];
}

export type BigInt = any;
export type DateTime = any;
