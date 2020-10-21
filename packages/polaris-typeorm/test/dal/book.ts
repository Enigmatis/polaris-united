import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {CommonModel} from '../../src';
import {Author} from './author';
import {Library} from './library';

@Entity()
export class Book extends CommonModel {
    @Column()
    public title: string;

    @ManyToOne(() => Author, (author) => author.books, {onDelete: 'CASCADE'})
    public author: Author;

    @ManyToOne(() => Library, (library) => library.books, {onDelete: 'CASCADE'})
    public library: Library;

    @PrimaryGeneratedColumn()
    protected id: string;

    constructor(title?: string, author?: Author) {
        super();
        if (title) {
            this.title = title;
        }
        if (author) {
            this.author = author;
        }
    }

    public getId(): string {
        return this.id;
    }
}
