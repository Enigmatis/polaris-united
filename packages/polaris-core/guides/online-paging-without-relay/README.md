## Online Pagination without relay

In order to use the online paging without relay mechanism, you'll need to take a few simple steps:
1. Create a new query, which will represent the online paging request you wish to execute, under query type.
   For example:
```graphql
onlinePaginatedAuthors: [Author]!
```
As you can see, it looks like a simple query you can use to fetch data.

2. Now you'll need to decide which implementation of online pagination you'd like to use - POLARIS gives you the
   option to choose the sort mechanism that you'll use in the resolver. Remember that what works best for one resolver
   might not work the same way for another resolver, so consider using both options according to your needs. Try
   using both ways before choosing, consider synchronization time and polling time to choose which mechanism works for you.
   
3. Create an appropriate resolver for your new query - there you will be in charge of the online pagination logic.
   
   Example of left-join online paging implementation:
```typescript
onlinePaginatedAuthors: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<OnlinePaginatedResolver<Author>> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return {
               getData: async (): Promise<Author[]> => {
                  return connection.getRepository(Author, context).findWithLeftJoinSortedByDataVersion({
                             relations: ['books'],
                 });
               },
            };
        }
```   

   Example of inner-join online paging implementation:
```typescript
onlinePaginatedAuthors: async (
            parent: any,
            args: any,
            context: PolarisGraphQLContext,
        ): Promise<OnlinePaginatedResolver<Author>> => {
            const connection = getPolarisConnectionManager().get(process.env.SCHEMA_NAME);
            return {
               getData: async (): Promise<Author[]> => {
                  return connection.getRepository(Author, context).findWithInnerJoinSortedByDataVersion({
                     relations: ['books'],
                  });
               },
            };
        }
```  

Note that you have to use the `OnlinePaginatedResolver` as your return type, and in the implemented method `getData` you must return your entities sorted by their data version, so you'll have to use the `findSortedByDataVersion` method that sorts the entities by their max linked data version.
Notice that the differences between the implementations are expressed in calling to different `polarisRepository` method.
### Request Headers

In order to use the online paging correctly you'll need to use the compatible request headers.
- `page-size` - *optional* if set to a number, it will be the page size. If not, the size will be taken from the default configurations.
- `data-version` - *optional* if not set, will always fetch the first page according to the page-size. Serves as the primary cursor.
- `last-id-in-dv` - *optional* serves as the secondary cursor.


**Pay Attention!** The entities are sorted firstly by the `data-version` header and secondly by the`last-id-in-dv` header.
The cursor runs according to that sort, so only sending the `last-id-in-dv` header won't serve the purpose of the cursor since the data version of the entity could've been changed.

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
