import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommonModel } from '../../src';
import { Author } from './author';

@Entity()
export class Pen extends CommonModel {
    @Column({ nullable: true })
    public color: string;

    @ManyToOne(() => Author, (author) => author.pens, { onDelete: 'CASCADE' })
    public author?: Author;

    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    constructor(color: string, author?: Author) {
        super();
        this.color = color;
        this.author = author;
    }

    public getId(): string {
        return this.id;
    }
}
