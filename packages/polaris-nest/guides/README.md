# Polaris With Nest.js

Nest is a great framework which lets us have `IOC` and the `Code First` GraphQL approach.
So naturally, we had to integrate with it as well.

# Polaris Module

To get the abilities polaris provides, you have to import in your App Module the `PolarisModule`.
Use `register`/`registerAsync` it. If you use `register`, just like polaris,
pass it `PolarisCoreOptions` or `PolarisNestSchemaFirstOptions`, see [configuration](https://github.com/Enigmatis/polaris-united/tree/development/packages/polaris-core/guides/configurations) for more info. 
If you use `registerAsync` pass `PolarisModuleAsyncOptions`, use `useFactory` and pass it a factory that creates `PolarisCoreOptions` or `PolarisNestSchemaFirstOptions`.
 
```typescript 
   PolarisModule.registerAsync({ useFactory: createOptionsFactory})
```

# TypeOrm Module

To get the abilities of polaris typeorm, you have to import in you App Module the `TypeOrmModule` from `polaris-nest`.
Use `register`/`registerAsync` it. If you use `register`, you should pass it `PolarisTypeOrmModuleOptions`, which includes `PolarisLogger`, `PolarisConnectionManager` and other properties of `ConnectionOptions`.
If you use `registerAsync` pass a factory that generates `PolarisTypeOrmModuleOptions`.

```typescript
    TypeOrmModule.forRootAsync({
        useClass: TypeOrmOptionsFactoryService,
        inject: [PolarisServerConfigService],
        imports: [PolarisServerConfigModule],
    })
```

# TypeOrmModule.forFeature

To use a specific repository, you should specify in the module imports the import,
with the entities you need their repositories.

```typescript
@Module({
    imports: [TypeOrmModule.forFeature([Author])],
    providers: [AuthorResolver, AuthorService],
})
export class AuthorModule {}
``` 

```typescript
@Injectable({ scope: Scope.REQUEST })
export class AuthorService {
    private authorRepository: PolarisRepository<Author>;
    constructor(
        @Inject(PolarisTypeORMInjector)
        private readonly polarisTypeORMInjector: PolarisTypeORMInjector,
    ) {
        this.authorRepository = this.polarisTypeORMInjector.getRepository(Author);
    }

    public async create(firstName: string, lastName: string): Promise<Author> {
        const author = new Author(firstName, lastName);
        return ((await this.authorRepository.save(author)) as unknown) as Promise<Author>;
    }
}
``` 

In order to use the connection in your service, you should add
```typescript
private readonly connection: PolarisConnection;
```
as a class member, and add
```typescript
this.connection = this.polarisTypeORMInjector.getConnection();
```
to your service constructor.

If you have multiple connections, you should add a `TypeOrmModule`(like the example shown above) for each connection to your `app.module.ts`.

The `Author` resolver will look like this
```typescript
@Resolver(() => AuthorApi.Author)
export class AuthorResolver {
    constructor(
        private readonly authorService: AuthorService,
    ) {}

    @Mutation()
    public async createAuthor(
        @Args('firstName') firstName: string,
        @Args('lastName') lastName: string,
    ): Promise<Author[] | Author> {
        return this.authorService.create(firstName, lastName);
    }
}
```

# Logging

To get the polaris logger injected into your own modules, just import the `PolarisLoggerModule` and its service `PolarisLoggerService`.
For Example:

```typescript
@Module({
    imports: [TypeOrmModule.forFeature([Author]), PolarisLoggerModule],
    providers: [AuthorResolver, AuthorService, PolarisLoggerService],
})
export class AuthorModule {}
```
```typescript
@Resolver(() => AuthorApi.Author)
export class AuthorResolver {
    constructor(
        private readonly authorService: AuthorService,
        private readonly loggerService: PolarisLoggerService,
    ) {}

    @Query(() => [AuthorApi.Author])
    public async authors(): Promise<Author[]> {
        return this.authorService.find();
    }
    @Query(() => [AuthorApi.Author])
    public async authorsByFirstName(@Args('name') id: string): Promise<Author[]> {
        this.loggerService.debug('in authors by name');
        return this.authorService.findByName(id);
    }
}
```

# Deprecation
In case you'll want to deprecate one of your fields using the `@deprecated` directive you can do it like the examples below.

## Schema First:
Let's say your schema look like this:
```
type Author implements RepositoryEntity {
    id: String!
    deleted: Boolean!
    createdBy: String!
    creationTime: DateTime!
    lastUpdatedBy: String
    lastUpdateTime: DateTime
    realityId: Int!
    dataVersion: BigInt!
    firstName: String
    lastName: String
    books: [Book]
    pens: [Pen]
    country: String @deprecated
    deprecatedField: String @deprecated(reason: "Will be removed in the next version")
}
```

As you can see we added the `@deprecated` directive to two fields, `country` and `deprecatedField`. `country` will have the default deprecation message and `deprecatedField` will have the custom message that we added.

Whenever you'll try to fetch the deprecated fields, you'll receive a warning in your response with all the deprecated fields that were fetched in the query.
The response will look like this:
```json
{
    "data": {
        "allAuthors": [
            {
                "id": "53afd7e5-bf59-4408-acbc-1c5ebb5ff146",
                "firstName": "Author1",
                "lastName": "First",
                "country": "Israel",
                "deprecatedField": "foo"
            },
            {
                "id": "4fab24e4-f584-4077-bb93-09cdfc88b202",
                "firstName": "Author2",
                "lastName": "Two",
                "country": "Italy"
            }
        ]
    },
    "extensions": {
        "globalDataVersion": 2,
        "warnings": ["The following requested field(s) are deprecated: country,deprecatedField"]
    }
}
```

## Code First

Let's say your entity looks like this:
```typescript
@ObjectType({
    implements: [RepositoryEntity],
})
export class Author extends RepositoryEntity {
    @Field(() => String)
    public firstName: string;

    @Field({ nullable: true })
    public lastName?: string;

    @Field(() => [Book], { nullable: true })
    public books: Book[];

    @Field({ nullable: true, deprecationReason: 'Will be removed in the next version' })
    public country: string;

    @Field({ nullable: true, deprecationReason: 'Will be removed in the next version' })
    public deprecatedField: string;

    @Field(() => [Pen], { nullable: true })
    public pens: Pen[];
}
```
In order to deprecate a field, you'll need to add the `deprecationReason` property to the `@Field` decorator(as shown above).

Whenever you'll try to fetch the deprecated fields, you'll receive a warning in your response with all the deprecated fields that were fetched in the query.
The response will look like this:
```json
{
    "data": {
        "allAuthors": [
            {
                "id": "53afd7e5-bf59-4408-acbc-1c5ebb5ff146",
                "firstName": "Author1",
                "lastName": "First",
                "country": "Israel",
                "deprecatedField": "foo"
            },
            {
                "id": "4fab24e4-f584-4077-bb93-09cdfc88b202",
                "firstName": "Author2",
                "lastName": "Two",
                "country": "Italy"
            }
        ]
    },
    "extensions": {
        "globalDataVersion": 2,
        "warnings": ["The following requested field(s) are deprecated: country,deprecatedField"]
    }
}
```
