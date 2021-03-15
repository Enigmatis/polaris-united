import {
    Column,
    CommonModel,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from '@enigmatis/polaris-core';
import { Book } from './book';
import { Pen } from './pen';

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

    constructor(firstName: string, lastName: string) {
        super();
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public getId(): string {
        return this.id;
    }
}
