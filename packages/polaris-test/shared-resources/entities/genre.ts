import {
    Column,
    CommonModel,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from '@enigmatis/polaris-core';
import { Book } from './book';

@Entity()
export class Genre extends CommonModel {
    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    @Column()
    public name: string;

    @ManyToMany((type) => Book, (book) => book.genres)
    @JoinTable()
    public books: Book[];

    getId(): string {
        return this.id;
    }
}
