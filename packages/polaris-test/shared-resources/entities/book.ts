import {
    Column,
    CommonModel,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from '@enigmatis/polaris-core';
import { Author } from './author';
import { Chapter } from './chapter';
import { Review } from './review';
import { Genre } from './genre';
import { OneToOneEntity } from './one-to-one-entity';

@Entity()
export class Book extends CommonModel {
    @Column({ nullable: true })
    public title: string;

    @ManyToOne(() => Author, (author) => author.books, { onDelete: 'CASCADE' })
    public author?: Author;

    @OneToMany(() => Chapter, (chapters) => chapters.book)
    public chapters: Chapter[];

    @OneToMany(() => Review, (reviews) => reviews.book)
    public reviews: [];

    @RelationId((book: Book) => book.chapters)
    public chaptersIds?: string[];

    @ManyToMany((type) => Genre, (genre) => genre.books)
    public genres: Genre[];

    @OneToOne((type) => OneToOneEntity)
    public oneToOneEntity: OneToOneEntity[];

    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    constructor(title: string, author?: Author, id?: string) {
        super();
        this.title = title;
        this.author = author;
        if (id) {
            this.id = id;
        }
    }

    public getId(): string {
        return this.id;
    }
}
