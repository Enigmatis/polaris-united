# Configurations with Polaris

In this section we will explain the optional and required properties you will pass to your `Polaris Server`.

# Polaris Server
You will use this server in order to create your own standardized GraphQL server.
`PolarisServer` uses `ApolloServer` and starts the server with `Express`.

### PolarisServerOptions

Through this interface you should set the following configurations which will be supplied to the `PolarisServer`:

-   **typeDefs** (_DocumentNode | DocumentNode[] | string | string[]_) - The GraphQL schema written in SDL(Schema Definition Language).
    This will be used in order to create your GraphQL API.
-   **resolvers** (_IResolvers | IResolvers[]_) - The GraphQL resolvers that will be tied to your GraphQL schema.
    This object contains functions and logic for the GraphQL engine to invoke when using fields from the schema.
-   **port** (_number_) - Specify a port the `PolarisServer` should start the server on.
    -   **maxPageSize** (_number - optional_) - *Defaults to 50*. The max page size for paging.
-   **applicationProperties** (_ApplicationProperties - optional_) - Interface from polaris-logs. Properties that describe your repository.
    If you don't provide those properties, the core will put 'v1' in the version.
-   **logger** (_LoggerConfiguration | PolarisGraphQLLogger - optional_) - You can pass an interface that defines the logger in the `PolarisServer`, or your own logger.
-   **middlewareConfiguration** (_MiddlewareConfiguration - optional_) - This is an interface that defines what core middlewares should be activated/disabled.
-   **allowSubscription** (boolean - optional) - Responsible for creating a websocket endpoint for graphql subscriptions.
-   **customMiddlewares** (_any[] - optional_) - Custom middlewares that can be provided the `PolarisServer` with.
-   **customContext** (_(context: any, connection?: Connection) => any - optional_) - You can provide the `PolarisServer` your own custom context.
    If you do not set your custom context, the core will use a default context.
    If you do not provide this property, the core will use default values for the logger.
-   **supportedRealities** (_RealitiesHolder - optional_) - Responsible for your provided realities.
-   **shouldAddWarningsToExtensions** (_boolean - optional_) - _Default: true._ Specifies whether to return the warnings in the response extensions or not.
-   **allowMandatoryHeaders** (_boolean - optional_) - _Default: false._ When set to true, every request must have `reality-id` and `requesting-sys` headers.
-   **snapshotConfig** (_SnapshotConfiguration - optional_) - This is an interface that defines how the snapshot process will act.
-   **connectionManager** (_Connection - optional_) - This class represents your connection with the database. Used in the core middlewares.
-   **enableFederation**  (_boolean - optional_) - _Default: true. Notifies Polaris if to build a federated schema.
-   **permissionsConfig** (_PermissionsConfiguration - optional_) - This is an interface that provide additional functionality to the permission process.
-   **enableDataVersionFilter**  (_boolean - optional_) - _Default: true. Returns entities based on descendants that changed after the requested data version.  
-   **connectionlessConfiguration** (_ConnectionlessConfiguration - optional_) - an interface that defines all the signatures on functions connected to the db from polaris, and calls them if provided.
-   **notificationCenterConfig** (_NotificationCenterConfig - optional_) - an interface that defines the properties that needed in order to define and manage the kafka connection when executing mutations.

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
-   **enablePermissions** (_boolean_) - Boolean value that determine if the external permissions service should be queried.

### SnapshotConfiguration

-   **snapshotCleaningInterval** (_number_) - _Default: 60. - Every cleaning-period millisecond, there is an execution of a function that checks if the snapshot is outdated and needs to be deleted from db.
-   **secondsToBeOutdated** (_number_) - _Default: 60. - In Seconds. Determines for how long the snapshot should be saved in db.
-   **maxPageSize** (_number_) - _Default: 50. The size of the maximum snapshot page.
-   **entitiesAmountPerFetch** (_number_) - _Default: 50. The amount of entities that should be fetched in every DB interaction. Should always be larger or equal to `maxPageSize`.
-   **autoSnapshot** (_boolean_) - _Default: false. If true, on snapshot data fetchers, returns data in the request if smaller than the configured page size.

### ConnectionlessConfiguration

-   **getDataVersion** (_(): Promise<DataVersion>_) - returns the current data version of the data service.
-   **saveSnapshotPages** (_(pages: SnapshotPage[]): void_) - saves the provided snapshot pages.
-   **saveSnapshotMetadata** (_(metadata: SnapshotMetadata): Promise<SnapshotMetadata>_) - saves the provided snapshot metadata.
-   **updateSnapshotPage** (_(pageId: string, pageToUpdate: Partial<SnapshotPage>): void_) - updates the provided snapshot page.
-   **updateSnapshotMetadata** (_(metadataId: string, metadataToUpdate: Partial<SnapshotMetadata>): void_) - updates the provided snapshot metadata.
-   **getIrrelevantEntities** (_(typeName: string,criteria: ConnectionlessIrrelevantEntitiesCriteria): Promise<any[]>_) - returns the irrelevant entities ids.
-   **getSnapshotPageById** (_(id: string): Promise<SnapshotPage>_) - returns a snapshot page by its id. 
-   **getSnapshotMetadataById** (_(id: string): Promise<SnapshotMetadata | undefined>_) - returns a snapshot metadata by its id.
-   **deleteSnapshotPageBySecondsToBeOutdated** (_(secondsToBeOutdated: number): void_) - gets number of seconds, and deletes pages older than that.
-   **deleteSnapshotMetadataBySecondsToBeOutdated** (_(secondsToBeOutdated: number): void_) - gets number of seconds, and deletes metadatas older than that.
-   **startTransaction** (_(): any_) - start a transaction and return client/id or other to recognise your transaction by it.
-   **commitTransaction** (_(client?: any): void_) - uses the result of start transaction, and commits that transaction.
-   **rollbackTransaction** (_(client?: any): void_) - uses the result of start transaction, and rollbacks that transaction.

### NotificationCenterConfig

This interface represents the notification center configuration properties that needed in order to define and manage the kafka connection when executing mutations.
It contains:

-   **allowNotificationCenter** (_boolean - Required_) - whether to enable notification center updates whenever mutations occurs.
-   **topicName** (_string - Required_) - the name of the topic in which the mutations are going to be saved on kafka.
-   **kafkaClient** (_kafka - Required_) - the kafka client that will be used for manipulating and publishing events inyo kafka.
-   **topicPrefix** (_string - Optional_, _default: "repo"_) - the prefix to the topic's name.
-   **topicsAmountOfPartitions** (_number - Optional_, _default: 3_) - the amount of partitions the topic is going to have in kafka.
-   **partitionerSelector** (_ICustomPartitioner - Optional_, _default: kafkajs default partitioner_) - a function for select in ehich partitions new messages will be saved in a topic.
-   **topicsReplicationFactor** (_number - Optional_, _default: 1_) - the topic's replication factor on kafka. Note that it has to be greater than 0.
