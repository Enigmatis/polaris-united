import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Author } from './author';
import { Book } from './book';

@Entity()
export class Library {
    @Column({ nullable: true })
    public name: string;

    @ManyToOne(() => Author, (author) => author.libraries, { onDelete: 'CASCADE' })
    public author: Author;

    @OneToMany(() => Book, (books) => books.library)
    public books: Book[];
    @PrimaryGeneratedColumn('uuid')
    public id: string;
    @Column({
        name: 'dataVersion',
        type: 'real',
        default: 0,
    })
    private dataVersion: number;
    @Column({
        name: 'realityId',
        type: 'real',
        default: 0,
    })
    private realityId: number;
    @Column({ nullable: true })
    private createdBy: string;
    @CreateDateColumn()
    private creationTime: Date;
    @Column({ nullable: true })
    private lastUpdatedBy: string;
    @UpdateDateColumn()
    private lastUpdateTime: Date;
    @Column({
        name: 'deleted',
        type: 'boolean',
        default: false,
    })
    private deleted: boolean = false;
    constructor(name?: string, books?: Book[]) {
        if (name) {
            this.name = name;
        }
        if (books) {
            this.books = books;
        }
    }
}
