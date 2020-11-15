import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PolarisWarning } from '@enigmatis/polaris-common';

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
    public warnings: Buffer;

    @Column('bytea', { nullable: true })
    public errors: Buffer;

    @CreateDateColumn({ default: 'NOW()' })
    public creationTime: Date;

    constructor() {
        this.status = SnapshotStatus.IN_PROGRESS;
        this.currentPageIndex = 0;
        this.pagesCount = 0;
        this.pagesIds = [];
    }

    public addWarnings(warningsToAdd: PolarisWarning[]): void {
        const strWarnings: string[] = [];
        if (warningsToAdd) {
            warningsToAdd.forEach((warning) => {
                strWarnings.push(warning.toString());
            });
            const prevWarnings = this.getWarnings() ? this.getWarnings() + ',' : '';
            this.warnings = Buffer.from(prevWarnings + strWarnings.toString());
        }
    }

    public addErrors(errorsToAdd: Error[]): void {
        const strErrors: string[] = [];
        if (errorsToAdd) {
            errorsToAdd.forEach((error) => {
                strErrors.push(error.toString());
            });
            const prevErrors = this.getErrors() ? this.getErrors() + ',' : '';
            this.errors = Buffer.from(prevErrors + strErrors.toString());
        }
    }

    public getWarnings(): string {
        return this.warnings?.toString();
    }
    public getErrors(): string {
        return this.errors?.toString();
    }
}

export enum SnapshotStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
    FAILED = 'FAILED',
}
