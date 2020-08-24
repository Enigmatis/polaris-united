import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SnapshotStatus } from './snapshot-metadata';

@Entity()
export class SnapshotPage {
    @UpdateDateColumn({ onUpdate: 'NOW()' })
    public lastAccessedTime: Date;
    @PrimaryGeneratedColumn('uuid')
    public readonly id: string;

    @Column('bytea', { nullable: true })
    private data: Buffer;

    @Column('text')
    private status: SnapshotStatus;

    constructor(id: string) {
        this.id = id;
        this.status = SnapshotStatus.IN_PROGRESS;
    }

    public getData(): string {
        return this.data?.toString();
    }

    public getStatus(): SnapshotStatus {
        return this.status;
    }

    public setStatus(status: SnapshotStatus): void {
        this.status = status;
    }

    public setData(data: string): void {
        this.data = Buffer.from(data);
    }
}
