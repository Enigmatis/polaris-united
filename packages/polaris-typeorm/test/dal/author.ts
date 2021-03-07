import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonModel } from '../../src';
import { Book } from './book';
import { Library } from './library';
import { Pen } from './pen';

@Entity()
export class Author extends CommonModel {
    @Column({ nullable: true })
    public name: string;

    @OneToMany(() => Book, (books) => books.author, { cascade: true })
    public books: Book[];

    @OneToMany(() => Pen, (pen) => pen.author)
    public pens: Pen[] | undefined;

    @OneToMany(() => Library, (libraries) => libraries.author)
    public libraries: Library[];

    @PrimaryGeneratedColumn()
    protected id: string;

    constructor(name?: string, books?: Book[]) {
        super();
        if (name) {
            this.name = name;
        }
        if (books) {
            this.books = books;
        }
    }

    public getId(): string {
        return this.id;
    }
}
