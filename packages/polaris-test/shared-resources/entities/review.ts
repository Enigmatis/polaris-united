import {
    Column,
    CommonModel,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from '@enigmatis/polaris-core';
import { Book } from './book';
@Entity()
export class Review extends CommonModel {
    @Column()
    public rating: string;
    @Column()
    public description: string;

    @Column({ nullable: true })
    public name: string;

    @Column({ nullable: true })
    public site: string;

    @ManyToOne(() => Book, (book) => book.chapters, { onDelete: 'CASCADE' })
    public book: Book;

    @PrimaryGeneratedColumn()
    protected id: string;

    constructor(description: string, rating: string, book: Book, site?: string, name?: string) {
        super();
        this.description = description;
        this.rating = rating;
        this.book = book;
        if (site) {
            this.site = site;
        }
        if (name) {
            this.name = name;
        }
    }

    public getId(): string {
        return this.id;
    }
}
