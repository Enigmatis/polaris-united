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