import {Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {SnapshotStatus} from './snapshot-metadata';

@Entity()
export class SnapshotPage {
    @PrimaryGeneratedColumn('uuid')
    public readonly id: string;

    @Column('bytea', {nullable: true})
    public data: Buffer;

    @UpdateDateColumn({onUpdate: 'NOW()'})
    public lastAccessedTime: Date;

    @Column('text')
    public status: SnapshotStatus;

    constructor(id: string) {
        this.id = id;
        this.status = SnapshotStatus.IN_PROGRESS;
    }

    public getData(): string {
        return this.data?.toString();
    }

    public setData(data: string): void {
        this.data = Buffer.from(data);
    }
}
