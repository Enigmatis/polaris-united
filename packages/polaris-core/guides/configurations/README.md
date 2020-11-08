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

### PermissionsConfiguration

As mentioned above, this interface provides additional functionality to the permission process.

-   **systemPermissionsFunction** (_(context: PolarisGraphQLContext, entityTypes: string[], actions: string[]) => boolean_) - Custom function that will help you determine the result of the permissions process.
-   **permissionsHeaders** (_string[]_) - List of request headers names that you would want to transfer to the permissions service.
