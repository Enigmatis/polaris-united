import {
    Column,
    CommonModel,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from '@enigmatis/polaris-nest';
import { Author } from './author';

@Entity()
export class Book extends CommonModel {
    @Column({ nullable: true })
    public title: string;

    @ManyToOne(
        () => Author,
        author => author.books,
    )
    public author?: Author;

    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    @Column({ nullable: true })
    protected coverColor: string;

    constructor(title: string, author?: Author, coverColor?: string) {
        super();
        this.title = title;
        if (author) {
            this.author = author;
        }
        if (coverColor) {
            this.coverColor = coverColor;
        }
    }

    public getId(): string {
        return this.id;
    }
}
