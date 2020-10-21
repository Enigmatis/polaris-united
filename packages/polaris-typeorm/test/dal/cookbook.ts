import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {Author} from './author';
import {Book} from './book';

@Entity()
export class Cookbook extends Book {
    @Column()
    public title: string;
    public kosher: boolean;

    @PrimaryGeneratedColumn()
    protected id: string;

    constructor(title?: string, author?: Author, kosher: boolean = true) {
        super(title, author);
        this.kosher = kosher;
    }

    public getId(): string {
        return this.id;
    }
}
