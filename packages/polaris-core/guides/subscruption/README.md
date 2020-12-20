
### Subscriptions

Add the Subscription object to your schema

```
export const typeDefs = `
    type Query {
        ...
    }

    type Mutation {
        ...
        updateBook(id: String!, newTitle: String!): [Book]!
        ...
    }

    type Subscription {
        bookUpdated: Book
    }

    type Book implements RepositoryEntity {
        ...
    }
`;

```

now let's implement the subscription resolver logic

```
import { PubSub } from '@enigmatis/polaris-core';

const pubsub = new PubSub();
const BOOK_UPDATED = 'BOOK_UPDATED';

export const resolvers = {
    Query: { ... },
    Mutation: { ... },
    Subscription: {
        bookUpdated: {
            subscribe: () => pubsub.asyncIterator([BOOK_UPDATED]),
        },
    },
};
```

and inside the updateBook resolver we will publish the book that got changed:

```
pubsub.publish(BOOK_UPDATED, { bookUpdated: myBook })
```

When you create the server you have to allow subscriptions, so the server could create the endpoint

```
const server = new PolarisServer({
    typeDefs,
    resolvers,
    port: 8080,
    allowSubscription: true,
});
```

Just pay attention that in case you are using custom context as well, the subscription context will be different,
you can handle it like so:

```
const customContext = (context: ExpressContext): Partial<CustomContext> => {
    const { req, connection } = context;
    const headers = req ? req.headers : connection?.context;

    return {
        customField: 1000,
        requestHeaders: {
            customHeader: headers['custom-header'],
        },
    };
};
```
