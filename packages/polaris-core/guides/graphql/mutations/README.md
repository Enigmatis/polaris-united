# Mutations - (Transactions)

with graphql you can also define how to update your data,
graphql operations that update data are called mutations.
Mutations are the same as queries, but mutations are allowed to change data.
Creating a mutation is quite simple and is similar to queries.

```
type Mutation {
  addBook: Book
}
```

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
    Mutation: {
        addBook: (parent: any, args: { id: string; title: string }): Book => {
            const book: Book = {
                id,
                title,
                realityId: 0,
                createdBy: 'me',
                creationTime: new Date(),
            };
            allBooks.push(book);
            return book;
        },
    },
};
```

Mutations are transactional by default! Every update you will do in one mutation will happen in the same transaction,
and if you send multiple mutations in one graphql request, they all will be executed in the same transaction.
Check configurations section to view how to change this.