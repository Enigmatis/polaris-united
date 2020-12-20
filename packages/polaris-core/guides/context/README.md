
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
