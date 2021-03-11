import {
    Column,
    CommonModel,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from '@enigmatis/polaris-core';
import { Book } from './book';

@Entity()
export class OneToOneEntity extends CommonModel {
    @PrimaryGeneratedColumn('uuid')
    protected id!: string;

    @Column()
    public name: string;

    @OneToOne((type) => Book)
    @JoinColumn()
    public book: Book[];

    getId(): string {
        return this.id;
    }
}
