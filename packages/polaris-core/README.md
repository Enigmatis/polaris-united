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
