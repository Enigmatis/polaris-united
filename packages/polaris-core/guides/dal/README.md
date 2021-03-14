
### Common model entities

Most of the entities your repository containing are extending the `CommonModel` entity
which defining the base skeleton of each `CommonModel` derived entity.
Each entity of those will have to contain an identifier property - as for now this property
name have to be `id`.

For Example:
```typescript
@Entity()
export class Genre extends CommonModel {
    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    @Column()
    public name: string;

    @ManyToMany((type) => Book, (book) => book.genres)
    @JoinTable()
    public books: Book[];

    getId(): string {
        return this.id;
    }
}
```

As you can see `Genre` extends `CommonModel`, and its identifier property is `protected id!: string;`
with the name `id` as required.