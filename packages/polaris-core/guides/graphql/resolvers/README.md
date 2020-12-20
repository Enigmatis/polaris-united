# Resolvers with Polaris

In GraphQL, resolvers are the functionality that indicates how you retrieve data for each field.

Let's look at this example:

```typescript
export const allBooks: [Book] = [
    { id: 1, title: 'Book1', realityId: 0, createdBy: 'author1', creationTime: new Date() },
    { id: 2, title: 'Book2', realityId: 0, createdBy: 'author2', creationTime: new Date() },
    { id: 3, title: 'Book3', realityId: 0, createdBy: 'author3', creationTime: new Date() },
    { id: 4, title: 'Book4', realityId: 1, createdBy: 'author4', creationTime: new Date() },
];

export const resolvers = {
    Query: {
        allBooks: (): [Book] => allBooks,
        bookByTitle: (parent: any, args: { title: string }): Book => {
            return allBooks.filter((book: Book) => book.title === args.title);
        },
    },
};
```

We defined two access points to our data on our schema, for the type query.

```
type Query {
  allBooks: [Book]!
  bookByTitle: Book
}
```

We will add the query type to the typeDefs we pass to the server, and the resolves we will pass in the resolvers configuration.
