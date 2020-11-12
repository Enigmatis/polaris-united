import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PolarisError } from '@enigmatis/polaris-common';

@Entity()
export class SnapshotMetadata {
    @PrimaryGeneratedColumn('uuid')
    public readonly id: string;

    @UpdateDateColumn({ onUpdate: 'NOW()' })
    public lastAccessedTime: Date;

    @Column('text', { array: true })
    public pagesIds: string[];

    @Column({ nullable: true })
    public pagesCount: number;

    @Column({ nullable: true })
    public currentPageIndex: number;

    @Column('text')
    public status: SnapshotStatus;

    @Column({ nullable: true })
    public irrelevantEntities: string;

    @Column({ nullable: true })
    public dataVersion: number;

    @Column({ nullable: true })
    public totalCount: number;

    @Column('bytea', { nullable: true })
    public warnings: string;

    @Column('bytea', { nullable: true })
    public errors: string;

    @CreateDateColumn({ default: 'NOW()' })
    public creationTime: Date;

    constructor() {
        this.status = SnapshotStatus.IN_PROGRESS;
        this.currentPageIndex = 0;
        this.pagesCount = 0;
        this.pagesIds = [];
    }

    public addWarnings(warningsToAdd: string): void {
        if (warningsToAdd) {
            if (!this.warnings) {
                this.warnings = '';
            }
            this.warnings = this.warnings.concat(warningsToAdd);
        }
    }

    public addErrors(errorsToAdd: any): void {
        if (!this.errors) {
            this.errors = '';
        }
        if (errorsToAdd instanceof Array) {
            errorsToAdd.forEach((err: PolarisError) => {
                this.errors = this.errors.concat(err.message);
            });
        } else if (errorsToAdd) {
            this.errors = this.errors.concat(errorsToAdd);
        }
    }
}

export enum SnapshotStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
    FAILED = 'FAILED',
}
