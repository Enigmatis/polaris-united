# Date Filter On RepositoryEntity

#### DateRangeFilterTypeDef

The `DateRangeFilter` typedef defines a new date range filter to be available within the polaris based repository.
It contains `gt`, `gte`, `lt` and `lte` fields which offers a various of filter-by-date options.
The `gt` refers to **Greater Than(>) operator**.
The `gte` refers to **Greater Than Equals(>=) operator**.
The `lt` refers to **Less Than(<) operator**.
The `lte` refers to **Less Than Equals(<=) operator**.

#### EntityFilterTypeDef

The `EntityFilter` typedef defines an ENTITY `creationTime` or `lastUpdateTime` date filters of type `DateRangeFilter`.
You can use `EntityFilter` input type whenever or wherever you want when you write **Queries** in your schema.

### Date filter example

In order to have the ability to execute queries with the `EntityFilter` filter you don't need to do much work.
First, create the relevant query in your schema and add `EntityFilter` argument to it:

```
exampleEntities(filter: EntityFilter): [ExampleEntity]!
```

So, as you can see we've added new query that contains the `EntityFilter` input type as argument of our query.

Now, we'll show you the structure of the `EntityFilter` input type you need to pass as a variable:
```
filter: {
    creationTime: {
        gt: "2020-08-23",
        lt: ...
    },
    lastUpdateTime: {
        lte: "2022-01-17",
        gte: "2020-06-06",
        gt: ...
    }
}
```
**IMPORTANT NOTE!**

When using a nest-based version of the infrastructure and executing a multiple queries request which contains at least 1 `date-filter` query, the returned response may be wrong.

After you followed and implemented the steps above your query will support filter of your entities by their `creationTime` ot `lastUpdateTime`.
