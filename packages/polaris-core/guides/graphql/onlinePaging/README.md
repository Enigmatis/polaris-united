
#### PageInfoTypeDefs

The `PageInfo` typedefs provides a metadata information when executing an online pagination.
It contains `startCursor` and `endCursor` which indicates the current page limits.
In general the cursor's job is to determine which field our paging based on - it could be any field(usually the `id` of the entity).
It also contains `hasNextPage` and `hasPreviousPage` indicators relative to the current page.

#### OnlinePagingInputTypeDefs

The `OnlinePagingInput` typedefs simply defines new input type that our graphql request should accept.
It contains `first`, `last`, `before`, and `after` inputs 

#### ExecutableSchemaCreator

This class will combine the type defs and resolvers offered by user, with polaris-schema repository entity and scalars,
to one executable schema.

# Usage and example of Online Pagination

In order to have the ability of online paging you need to do few simple steps:
1. create 2 new types in your graphql schema for each entity you would use online paging with - one for the connection and one for the edges.
For example:

```graphql
    type BookEdge {
        node: Book
        cursor: String
    }
    
    type BookConnection {
        pageInfo: PageInfo
        edges: [BookEdge]
    }
```
As you can see I've added `BookConnection` type and `BookEdge` type.

2. create a new query, which will represent the online paging request you wish to execute, under query type.
For example:
```graphql
onlinePaginatedBooks(pagingArgs: OnlinePagingInput!): BookConnection
```
As you can see I've create `onlinePaginatedBooks` query which takes `OnlinePagingInput` as parameter and returns the `BookConnection` type we've already created.
3. create appropriate resolver for your new query - there you will be in charge of the pagination logic.
For example:
```
onlinePaginatedBooks: async (parent: any, args: any, context: TestContext): Promise<PageConnection<Book>> => {
    const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
    let books = await connection.getRepository(Book).find(context);
    books.sort((book1, book2) => (book1.getId() > book2.getId() ? 1 : -1));
    const copyOfBooks = books;
    if (args.pagingArgs.after) {
        books = books.filter((book) => book.getId() > args.pagingArgs.after);
    }
    if (args.pagingArgs.before) {
        books = books.filter((book) => book.getId() < args.pagingArgs.before);
    }
    if (args.pagingArgs.first) {
        books = books.slice(0, Math.min(books.length, Number(args.pagingArgs.first)));
    } else if (args.pagingArgs.last) {
        books = books.slice(
            Math.max(0, books.length - Number(args.pagingArgs.last)),
            books.length,
        );
    }
    const edges: Edge<Book>[] = [];
    books.forEach((book) => {
        edges.push({ node: book, cursor: book.getId() });
    });
    return {
        pageInfo: {
            startCursor: books[0].getId(),
            endCursor: books[books.length - 1].getId(),
            hasNextPage:
                copyOfBooks.indexOf(books[books.length - 1]) + 1 < copyOfBooks.length,
            hasPreviousPage: copyOfBooks.indexOf(books[0]) > 0,
        },
        edges,
    };
},
```
In this example we used the `id` field to be the `cursor`.
Every resolver of online paging query will need to return `Promise<PageConnection<ENTITY>>` - where <ENTITY> is the type of the paged entity(in this case `Book`).
Note that the implementation you see above is the suggested one but you can implement it as you like.

Note that `PageInfo` and `OnlinePagingInput` typedefs comes built-in POLARIS so you don't need to refer them.
Also note that the implementation of the online paging was by the [relay spec](https://relay.dev/graphql/connections.htm)
