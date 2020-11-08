
### Warnings

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
