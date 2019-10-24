import {Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

export abstract class CommonModel {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: 'real',
        default: 0})
    dataVersion: string;

    @Column()
    realityId: number = 0;

    @Column({nullable: true})
    createdBy: string;

    @CreateDateColumn()
    creationTime: Date;

    @Column({nullable: true})
    lastUpdatedBy: string;

    @UpdateDateColumn()
    lastUpdateTime: Date;

    @Column()
    deleted: boolean = false;
}