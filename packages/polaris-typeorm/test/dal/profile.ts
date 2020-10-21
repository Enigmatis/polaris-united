import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonModel } from '../../src';

@Entity()
export class Profile extends CommonModel {
    @Column()
    public gender: string;

    @PrimaryGeneratedColumn()
    protected id: string;

    constructor(gender?: string) {
        super();
        if (gender) {
            this.gender = gender;
        }
    }

    public getId(): string {
        return this.id;
    }
}
