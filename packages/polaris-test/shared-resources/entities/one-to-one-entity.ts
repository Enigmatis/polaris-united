import {
    Column,
    CommonModel,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from '@enigmatis/polaris-core';
import { Book } from './book';
import { Genre } from './genre';

@Entity()
export class OneToOneEntity extends CommonModel {
    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    @Column()
    public name: string;

    @OneToOne((type) => Book)
    public book: Book;

    @OneToOne((type) => Genre)
    @JoinColumn()
    public genre: Genre;

    constructor(name: string, book?: Book, genre?: Genre) {
        super();
        this.name = name;
        if (book) {
            this.book = book;
        }
        if (genre) {
            this.genre = genre;
        }
    }

    getId(): string {
        return this.id;
    }
}
