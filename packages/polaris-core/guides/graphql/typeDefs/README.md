# GraphQL Schema with Polaris

#### RepositoryEntity

This interface represents the base entity definitions of any graphql entity that we will create -
which means that any graphql entity you will use, must inherit this interface properties.
It consists the following properties:

-   id: the unique id of the entity.
-   createdBy: who created the entity.
-   creationTime: when was the entity created.
-   lastUpdatedBy(_string - Optional_): who last updated the entity.
-   lastUpdateTime(_Date - Optional_): when was the entity last updated.
-   realityId: the id of the reality the entity is from.

So if we want to create an entity of type book we will implement `RepositoryEntity` like this:

```typescript
export class Book implements RepositoryEntity {
    title: string;
}
```

We will create the next sdl and pass it to our server, in the typeDefs configuration.

```typescript
 export const typeDefs = `
type Book implements RepositoryEntity { 
        id: String!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        title: String! }
`;
```
