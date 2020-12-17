![Small Logo](static/img/polaris-logo.png)

# polaris-schema

[![Build Status](https://travis-ci.com/Enigmatis/polaris-schema.svg?branch=master)](https://travis-ci.com/Enigmatis/polaris-schema)
[![NPM version](https://img.shields.io/npm/v/@enigmatis/polaris-schema.svg?style=flat-square)](https://www.npmjs.com/package/@enigmatis/polaris-schema)

#### Install

```
npm install polaris-schema
```

### Overview

This library helps you set all of the fundamental definitions of polaris based schema.

#### RepositoryEntity

This interface represents the base entity definitions of any graphql entity that we will create -
which means that any graphql entity you will use, must inherit this interface properties.
It consists the following properties:

-   id: the unique id of the entity.
-   deleted: whether the entity is soft deleted.
-   createdBy: who created the entity.
-   creationTime: when was the entity created.
-   lastUpdatedBy(_string - Optional_): who last updated the entity.
-   lastUpdateTime(_Date - Optional_): when was the entity last updated.
-   realityId: the id of the reality the entity is from.

#### PageConnection<ENTITY>

This interface represents generic connection type(of type <ENTITY>) to use when implementing an online pagination - it
contains `pageInfo` and `edges` fields which determines our page structure and data it will contain.
Below will be more explanation about these fields and usage.

#### PageInfo

This interface represents a metadata-like information about our current page when executing an online pagination.
It may contains information like `startCursor` and `endCursor` of our page and whether it `hasNextPage` and `hasPreviousPage`.

#### Edge<ENTITY>

This interface represents generic edge type(of type <ENTITY>).
Basically, edge refers to a single record in our page, each record like this contains the record's `cursor`
and the record's `node` as well.
`node` eventually is our real entity with the fields that we defined in our graphql schema. 

#### RepositoryEntityTypeDefs

This member is the actual graphql interface type definition that consists of all of the `RepositoryEntity` properties
explained above.

#### ScalarsTypeDefs & ScalarsResolvers

All of the scalars supported by polaris-schema.

#### PageInfoTypeDefs

The `PageInfo` typedefs provides a metadata information when executing an online pagination.
It contains `startCursor` and `endCursor` which indicates the current page limits.
In general the cursor's job is to determine which field our paging based on - it could be any field(usually the `id` of the entity).
It also contains `hasNextPage` and `hasPreviousPage` indicators relative to the current page.

#### OnlinePagingInputTypeDefs

The `OnlinePagingInput` typedefs simply defines new input type that our graphql request should accept.
It contains `first`, `last`, `before`, and `after` inputs

#### DateRangeFilterTypeDef

The `DateRangeFilter` typedef defines a new date range filter to be available within the polaris based repository.
It contains `gt`, `gte`, `lt` and `lte` fields which offers a various of filter-by-date options.
The `gt` refers to **Greater Than(>) operator**.
The `gte` refers to **Greater Than Equals(>=) operator**.
The `lt` refers to **Less Than(<) operator**.
The `lte` refers to **Less Than Equals(<=) operator**.

#### EntityFilterTypeDef

The `EntityFilter` typedef defines an ENTITY `creationTime` or `lastUpdateTime` date filters of type `DateRangeFilter`.
You can use `EntityFilter` input type whenever or wherever you want when you write **Queries** in your schema.
For more explained and understandable example visit the [Date filter example section here](https://github.com/Enigmatis/polaris-united/tree/development/packages/polaris-core).

#### ExecutableSchemaCreator

This class will combine the type defs and resolvers offered by user, with polaris-schema repository entity and scalars,
to one executable schema.

# Usage and example of Online Pagination

## Online Pagination with relay

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
As you can see i've added `BookConnection` type and `BookEdge` type.

2. create new query, which will represent the online paging request you wish to execute, under query type.
For example:
```graphql
onlinePaginatedBooks(pagingArgs: OnlinePagingInput!): BookConnection
```
As you can see i've create `onlinePaginatedBooks` query which takes `OnlinePagingInput` as parameter and returns the `BookConnection` type we've already created.
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

## Online Pagination without relay

In order to use the online paging without relay mechanism, you'll need to take a few simple steps:
1. Create a new query, which will represent the online paging request you wish to execute, under query type.
   For example:
```graphql
onlinePaginatedAuthors: [Author]!
```
As you can see, it looks like a simple query you can use to fetch data.

2. Create appropriate resolver for your new query - there you will be in charge of the online pagination logic.
For example:
```typescript
onlinePaginatedAuthors: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<OnlinePaginatedResolver<Author>> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return {
                getData: async (): Promise<Author[]> => {
                    return connection.getRepository(Author).findSortedByDataVersion(context, {
                        relations: ['books'],
                    });
                },
            };
        }
```   
Note that you have to use the `OnlinePaginatedResolver` as your return type, and in the implemented method `getData` you must return your entities sorted by their data version, so you'll have to use the `findSortedByDataVersion` method that sorts the entities by their max linked data version.
### Request Headers

In order to use the online paging correctly you'll need to use the compatible request headers.
- `page-size` - *optional* if set to a number, it will be the page size. If not, the size will be taken from the default configurations.
- `data-version` - *optional* if not set, will always fetch the first page according to the page-size. Serves as the cursor of the first entity that will be fetched in the page.
- `last-id-in-dv` - *optional* if not set will always fetch the first page according to the page-size and the data-version header. Serves as the cursor of the last id of the entity that was fetched in the previous page.

For example:
```json
{
   "page-size": 5,
   "data-version": 1,
   "last-id-in-dv": "some-id"
}
```

### Extensions
- `lastIdInDataVersion` - The ID of the last fetched entity.
- `lastDataVersionInPage`- The max data-version of the last entity, including its sub-entities.
- `dataVersion` - The global data-version of the repository.
- `irrelevantEntities` - The irrelevant entities related to the current fetched page.

For example:
```json
{
   "lastIdInDataVersion": "some-id",
   "lastDataVersionInPage": 25,
   "dataVersion": 150,
   "irrelevantEntities":{
      "onlinePaginatedAuthors":[
         "some-other-id",
         "another-id"
      ] 
   } 
}
```