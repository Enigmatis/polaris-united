import {
    Column,
    CommonModel,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from '@enigmatis/polaris-core';
import { Book } from './book';
import { OneToOneEntity } from './one-to-one-entity';

@Entity()
export class Genre extends CommonModel {
    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    @Column()
    public name: string;

    @ManyToMany((type) => Book, (book) => book.genres)
    @JoinTable()
    public books: Book[];

    @OneToOne((type) => OneToOneEntity)
    public oneToOneEntity: OneToOneEntity;

    constructor(name: string, books: Book[]) {
        super();
        this.name = name;
        this.books = books;
    }

    getId(): string {
        return this.id;
    }
}
