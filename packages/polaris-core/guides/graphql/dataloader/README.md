# Dataloaders with Polaris

DataLoader is a generic utility to be used as part of your application's data fetching layer to provide a simplified and consistent API over various remote data sources such as databases or web services via batching and caching.

Let's look at this example of how to implement a simple dataloader with `Chapter`:

```typescript
export const resolvers = {
    Query: {
        allBooks: (): [Book] => allBooks,
    },
    Book: {
        chapters: async (
            parent: Book,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<Chapter[] | undefined> => {
            if (parent && parent.chaptersIds) {
                const dataLoader = getDataLoader(Chapter.name, context, Chapter.prototype);
                if (dataLoader) {
                    return dataLoader.loadMany(parent.chaptersIds);
                }
            }
            return undefined;
        },
    },
};
```
In order to fetch a certain field with the dataloader, you'll need to add the parent as a resolver type in your resolvers(the example shows how to fetch chapters - where the parent entity is `Book`).

Now let's look at the relations between `Book` and `Chapter` in our entities configuration

This is how chapters are defined in `Book`
```typescript
@OneToMany(() => Chapter, (chapters) => chapters.book)
    public chapters: Chapter[];
```

This is how book is defined in `Chapter`
```typescript
@ManyToOne(() => Book, (book) => book.chapters, { onDelete: 'CASCADE' })
    public book: Book;
```

Additionally, you'll need to add `chapterIds` field with the`@RelationId` decorator to your parent DB entity(which is `Book` in our example)

```typescript
@RelationId((book: Book) => book.chapters)
    public chaptersIds?: string[];
```

The schema should like this:
```
type Query {
  allBooks: [Book]!
}
```
```
type Book implements RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        title: String
        author: Author
        chapters: [Chapter]
        reviews: [Review]
    }
```

An example query:
```
query{
  allBooks{
    id
    title
    chapters{
      id
      number
    }
  }
}
```

