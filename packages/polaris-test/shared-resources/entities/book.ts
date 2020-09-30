import {
    Column,
    CommonModel,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from '@enigmatis/polaris-core';
import { Author } from './author';
import { Chapter } from './chapter';

@Entity()
export class Book extends CommonModel {
    @Column({ nullable: true })
    public title: string;

    @ManyToOne(() => Author, (author) => author.books, { onDelete: 'CASCADE' })
    public author?: Author;

    @OneToMany(() => Chapter, (chapters) => chapters.book)
    public chapters: Chapter[];

    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    constructor(title: string, author?: Author) {
        super();
        this.title = title;
        this.author = author;
    }

    public getId(): string {
        return this.id;
    }
}
