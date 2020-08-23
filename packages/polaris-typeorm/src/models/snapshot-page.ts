import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SnapshotStatus } from './snapshot-metadata';

@Entity()
export class SnapshotPage {
    @UpdateDateColumn()
    public lastAccessedTime: Date;
    @PrimaryGeneratedColumn('uuid')
    private readonly id: string;

    @Column('bytea', { nullable: true })
    private data: Buffer;

    @Column('text')
    private status: SnapshotStatus;

    constructor(id: string) {
        this.id = id;
        this.status = SnapshotStatus.IN_PROGRESS;
    }

    public getId(): string {
        return this.id;
    }

    public getData(): string {
        return this.data?.toString();
    }

    public getStatus(): SnapshotStatus {
        return this.status;
    }

    public getLastAccessedTime(): Date {
        return this.lastAccessedTime;
    }

    public setLastAccessedTime(lastAccessedTime: Date): void {
        this.lastAccessedTime = lastAccessedTime;
    }

    public setStatus(status: SnapshotStatus): void {
        this.status = status;
    }

    public setData(data: string): void {
        this.data = Buffer.from(data);
    }
}
