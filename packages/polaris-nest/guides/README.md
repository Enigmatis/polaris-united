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

