import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommonModel } from '../../src';
import { Profile } from './profile';

@Entity()
export class User extends CommonModel {
    @Column()
    public name: string;

    @OneToOne(() => Profile)
    @JoinColumn()
    public profile: Profile;

    @PrimaryGeneratedColumn()
    protected id: string;

    constructor(name?: string, profile?: Profile) {
        super();
        if (name) {
            this.name = name;
        }
        if (profile) {
            this.profile = profile;
        }
    }

    public getId(): string {
        return this.id;
    }
}
