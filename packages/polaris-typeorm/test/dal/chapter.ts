import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommonModel } from '../../src';
import { Book } from './book';

@Entity()
export class Chapter extends CommonModel {
    @Column()
    public number: number;

    @ManyToOne(() => Book, (book) => book.chapters, { onDelete: 'CASCADE' })
    public book: Book;

    @PrimaryGeneratedColumn()
    protected id: string;

    constructor(chapterNumber: number, book?: Book) {
        super();
        if (chapterNumber) {
            this.number = chapterNumber;
        }
        if (book) {
            this.book = book;
        }
    }

    public getId(): string {
        return this.id;
    }
}
