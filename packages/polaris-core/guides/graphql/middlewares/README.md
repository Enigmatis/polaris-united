# Middlewares & Plugins

GraphQL Middleware lets you run arbitrary code before or after a resolver is invoked.
It improves your code structure by enabling code reuse, and a clear separation of concerns.


## Logger Plugin

The framework provides a logger plugin which writes logs for your query life cycle:
It writes logs before & after execution, fetching, etc.

## Filter Realities Middleware

This is another Polaris built-in middleware, which filters out all entities which are not compatible with the reality-id that was sent in the request headers.
Combined with the PolarisRepository functionality, you will only receive entities with the correct reality id, and if the `include-linked-oper` header is set to true,
you will receive entities with a truth reality, if they are referenced by the returned entities.

## Filter Data Version Middleware

This built-in middleware filters out entities which are smaller or equal to the data version which is sent in the data-version header.
This logic happens only in a first-level data fetcher (which his parent is Query), so sub entities can be with data-version which does not comply with the constraint mentioned above.
The filter is off if the `enableDataVersionFilter` is on in the data service configuration.

## Filter Deleted Entities Middleware

This built-in middleware filters out entities which were soft-deleted only if the server is configured correctly (do not return soft-deleted entities & allow soft delete).
The filter happens in all levels of data-fetchers.

## Custom Middleware

If you want to add other middlewares (either built-in such as Apollo Tracing, or custom middlewares),
you should implement a function with the next signature:
`async (
     resolve: any,
     root: any,
     args: any,
     context: any,
     info: GraphQLResolveInfo,
 ):any`

The next middleware filters all books that their titles doesn't start with `a`.
```typescript
export const customFilterMiddleware = async (
    resolve: any,
    root: any,
    args: any,
    context: any,
    info: GraphQLResolveInfo,
) => {
    const result = await resolve(root, args, context, info);
    if (result instanceof Array) {
        result.filter((instance) => {
            if (instance instanceof Book) {
                if (instance.title.startsWith('a')) {
                    return true;
                }
            }
        });
    }
    return result;
};
```
