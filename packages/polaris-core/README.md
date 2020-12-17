<p align="center">
    <img height="190" src="https://github.com/Enigmatis/polaris-nest-logger/raw/master/polarisen.png" alt="polaris logo" /><br><br>
    Create a graphql service easily, integrated with typeorm, middlewares, standard logs, and more!<br><br>
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@enigmatis/polaris-core">
    <img alt="npm (scoped with tag)" src="https://img.shields.io/npm/v/@enigmatis/polaris-core/beta">
    <img alt="Travis (.org) branch" src="https://travis-ci.com/Enigmatis/polaris-united.svg?branch=master">
    <a href="https://www.codacy.com/gh/Enigmatis/polaris-core?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Enigmatis/polaris-core&amp;utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/6a403edb43684b2382728837f58bbfbb"/></a>
</p>

# polaris-core

Polaris is a set of libraries that help you create the perfect graphql service, integrated with type orm and the hottest API standards.
polaris-core organizes all the libraries for you, and let you create your graphql service as easily as it can be.

## Features

-   GraphQL service creation (integrated with apollo-server & express)
-   Auto soft deletion of entities
-   Fetching Deltas of entities (including irrelevant entities)
-   Support realities
-   Standard errors
-   Standard logs
-   Standard GraphQL scalars
-   Online paging (with and without relay)
-   Offline paging

### PolarisServer

This is the server that you will use in order to create your own standardized GraphQL server.\
`PolarisServer` uses `ApolloServer` and starts the server with `Express`.

### PolarisServerOptions

Through this interface you should set the following configurations which will be supplied to the `PolarisServer`:

-   **typeDefs** (_any_) - The GraphQL schema written in SDL (Schema Definition Language).
    This will be used in order to create your GraphQL API.
-   **resolvers** (_any_) - The GraphQL resolvers that will be tied to your GraphQL schema.
    This object contains functions and logic for the GraphQL engine to invoke when using fields from the schema.
-   **port** (_number_) - Specify a port the `PolarisServer` should start the server on.
-   **maxPageSize** (_number - optional_) - *Defaults to 50*. The max page size for paging.    
-   **applicationProperties** (_ApplicationProperties - optional_) - Properties that describe your repository.
    If you don't provide those properties, the core will put 'v1' in the version.
-   **allowSubscription** (boolean - optional) - Responsible for creating a websocket endpoint for graphql subscriptions.
-   **customMiddlewares** (_any[] - optional_) - Custom middlewares that can be provided the `PolarisServer` with.
-   **customContext** (_(context: any, connection?: Connection) => any - optional_) - You can provide the `PolarisServer` your own custom context.
    If you do not set your custom context, the core will use a default context.
-   **loggerConfiguration** (_LoggerConfiguration - optional_) - This is an interface that defines the logger in the `PolarisServer`.
    If you do not provide this property, the core will use default values for the logger.
-   **middlewareConfiguration** (_MiddlewareConfiguration - optional_) - This is an interface that defines what core middlewares should be activated/disabled.
-   **connection** (_Connection - optional_) - This class represents your connection with the database. Used in the core middlewares.
-   **allowSubscription** (_boolean - optional_) - _Default: false._ Responsible for creating a websocket endpoint for graphql subscriptions.
-   **shouldAddWarningsToExtensions** (_boolean - optional_) - _Default: true._ Specifies whether to return the warnings in the response extensions or not.
-   **allowMandatoryHeaders** (_boolean - optional_) - _Default: false._ When set to true, every request must have `reality-id` and `requesting-sys` headers.
-   **permissionsConfig** (_PermissionsConfiguration - optional_) - This is an interface that provide additional functionality to the permission process.

### MiddlewareConfiguration

As mentioned above, this interface defines what core middlewares should be activated/disabled.

-   **allowDataVersionAndIrrelevantEntitiesMiddleware** (_boolean_) - Determine if `DataVersionMiddleware` and `IrrelevantEntitiesMiddleware` should be applied to the request.
-   **allowSoftDeleteMiddleware** (_boolean_) - Determine if `SoftDeleteMiddleware` should be applied to the request.
-   **allowRealityMiddleware** (_boolean_) - Determine if `RealityMiddleware` should be applied to the request.
-   **allowDatesFilterMiddleware** (_boolean_) - Determine if `DatesFilterMiddleware` should be applied to the request.

### PermissionsConfiguration

As mentioned above, this interface provides additional functionality to the permission process.

-   **systemPermissionsFunction** (_(context: PolarisGraphQLContext, entityTypes: string[], actions: string[]) => boolean_) - Custom function that will help you determine the result of the permissions process.
-   **permissionsHeaders** (_string[]_) - List of request headers names that you would want to transfer to the permissions service.

### Custom context

First we will define the new context type, pay attention that we just added a new field in the root of the context,
and a new header in the request headers object.

```typescript
import { PolarisGraphQLContext, PolarisRequestHeaders } from '@enigmatis/polaris-core';

interface CustomRequestHeaders extends PolarisRequestHeaders {
    customHeader?: string | string[];
}

export interface CustomContext extends PolarisGraphQLContext {
    customField: number;
    requestHeaders: CustomRequestHeaders;
}
```

Then we will pass the custom context like this:

```typescript
import { ExpressContext, PolarisServer } from '@enigmatis/polaris-core';

const typeDefs = `...`;
const resolvers = { ... };

const customContext = (context: ExpressContext): Partial<CustomContext> => {
    const { req } = context;

    return {
        customField: 1000,
        requestHeaders: {
            customHeader: req.headers['custom-header'],
        },
    };
};

const server = new PolarisServer({
    typeDefs,
    resolvers,
    port: 8082,
    customContext,
});
```

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

### Warnings

In order to have the ability of warnings, which returned in the extensions of the response, you will need to supply them to
polaris. you can supply the warnings through the context. let's see an example:

```
allBooksWithWarnings: async (
    parent: any,
    args: any,
    context: PolarisGraphQLContext,
): Promise<Book[]> => {
    const connection = getPolarisConnectionManager().get();
    context.returnedExtensions.warnings = ['warning 1', 'warning 2'];
    return connection.getRepository(Book).find(context, { relations: ['author'] });
}
```

And let's see an example of response with the warnings:

```json
{
    "data": {
        "allBooks": [
            {
                "id": "53afd7e5-bf59-4408-acbc-1c5ebb5ff146",
                "title": "Book1",
                "author": {
                    "firstName": "Author1",
                    "lastName": "First"
                }
            },
            {
                "id": "4fab24e4-f584-4077-bb93-09cdfc88b202",
                "title": "Book2",
                "author": {
                    "firstName": "Author2",
                    "lastName": "Two"
                }
            }
        ]
    },
    "extensions": {
        "globalDataVersion": 2,
        "warnings": ["warning 1", "warning 2"]
    }
}
```

You can see inside the `extensions` that we have the warnings we defined earlier.

### Example

```typescript
import { ApplicationProperties, PolarisServer } from '@enigmatis/polaris-core';

const typeDefs = `
    type Query {
        allPersons: [Person]
    }

    type Person implements RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        name: String
    }
`;
const resolvers = {
    Query: {
        allPersons: () => [
            { name: 'foo bar', realityId: 0, deleted: false, dataVersion: 2 },
            { name: 'superman', realityId: 0, deleted: true, dataVersion: 3 },
            { name: 'hello world', realityId: 1, deleted: true, dataVersion: 3 },
            { name: 'something', realityId: 1, deleted: false, dataVersion: 4 },
        ],
    },
};
const applicationProperties: ApplicationProperties = {
    id: 'p0laris-c0re',
    name: 'polaris-core',
    version: 'v1',
    environment: 'environment',
    component: 'component',
};
const server = new PolarisServer({
    typeDefs,
    resolvers,
    port: 4000,
    applicationProperties,
});
server.start();
```

For any additional help and requests, feel free to contact us :smile:

### Date filter example

In order to have the ability to execute queries with the `EntityFilter` filter you don't need to do much work.
First, create the relevant query in your schema and add `EntityFilter` argument to it:

```
exampleEntities(filter: EntityFilter): [ExampleEntity]!
```

So, as you can see we've added new query that contains the `EntityFilter` input type as argument of our query.

Now, w'll show you the structure of the `EntityFilter` input type you need to pass as a variable:
```
filter: {
    creationTime: {
        gt: "2020-08-23",
        lt: ...
    },
    lastUpdateTime: {
        lte: "2022-01-17",
        gte: "2020-06-06",
        gt: ...
    }
}
```
**IMPORTANT NOTE!**

When using a nest-based version of the infrastructure and executing a multiple queries request which contains at least 1 `date-filter` query, the returned response may be wrong. 

For more information about the structure of the `EntityFilter` visit [EntityFilterTypeDef section here](https://github.com/Enigmatis/polaris-united/tree/development/packages/polaris-schema)

After you followed and implemented the steps above your query will support filter of your entities by their `creationTime` ot `lastUpdateTime`.
