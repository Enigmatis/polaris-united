
## Warnings

In order to have the ability of warnings, which returned in the extensions of the response, you will need to supply them to
polaris. you can supply the warnings through the context. let's see an example:

```
allBooksWithWarnings: async (
    parent: any,
    args: any,
    context: PolarisGraphQLContext,
): Promise<Book[]> => {
    const connection = getPolarisConnectionManager().get();
    context.returnedExtensions.warnings = ['warning 1', 'warning 2'];
    return connection.getRepository(Book).find(context, { relations: ['author'] });
}
```

And let's see an example of response with the warnings:

```json
{
    "data": {
        "allBooks": [
            {
                "id": "53afd7e5-bf59-4408-acbc-1c5ebb5ff146",
                "title": "Book1",
                "author": {
                    "firstName": "Author1",
                    "lastName": "First"
                }
            },
            {
                "id": "4fab24e4-f584-4077-bb93-09cdfc88b202",
                "title": "Book2",
                "author": {
                    "firstName": "Author2",
                    "lastName": "Two"
                }
            }
        ]
    },
    "extensions": {
        "globalDataVersion": 2,
        "warnings": ["warning 1", "warning 2"]
    }
}
```

You can see inside the `extensions` that we have the warnings we defined earlier.

### Deprecation Warnings

In case you'll want to deprecate one of your fields using the `@deprecated` directive you can do it like the example below.

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

And your entity looks like this:
```typescript
@Entity()
export class Author extends CommonModel {
    @Column({ nullable: true })
    public firstName: string;

    @Column({ nullable: true, default: '' })
    public lastName: string;

    @OneToMany(() => Book, (book) => book.author)
    public books: Book[] | undefined;
    @OneToMany(() => Pen, (pen) => pen.author)
    public pens: Pen[] | undefined;

    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    @Column({ nullable: true })
    public country: string;

    @Column({ nullable: true })
    public deprecatedField: string;
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
