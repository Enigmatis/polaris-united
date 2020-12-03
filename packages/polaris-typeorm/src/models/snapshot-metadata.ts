import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { IrrelevantEntitiesResponse, PolarisWarning } from '@enigmatis/polaris-common';

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

    @Column('bytea', { nullable: true })
    public irrelevantEntities: Buffer;

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
    public addIrrelevantEntities(irrelevantEntitiesResponse: IrrelevantEntitiesResponse): void {
        this.irrelevantEntities = Buffer.from(JSON.stringify(irrelevantEntitiesResponse));
    }
    public addWarnings(warningsToAdd: PolarisWarning[]): void {
        const result = this.getBufferFromExistingBufferAndNewList(warningsToAdd, this.warnings);
        if (result) {
            this.warnings = result;
        }
    }

    public addErrors(errorsToAdd: Error[]): void {
        const result = this.getBufferFromExistingBufferAndNewList(errorsToAdd, this.errors);
        if (result) {
            this.errors = result;
        }
    }

    private getBufferFromExistingBufferAndNewList(
        newList: any[],
        buffer: Buffer,
    ): Buffer | undefined {
        let mergedList = [];
        if (buffer) {
            mergedList = JSON.parse(buffer.toString());
        }
        if (newList && newList.length > 0) {
            mergedList.push(...newList);
        }
        if (mergedList.length > 0) {
            return Buffer.from(JSON.stringify(mergedList));
        }
        return undefined;
    }

    public getWarnings(): string {
        return this.warnings?.toString();
    }
    public getErrors(): string {
        return this.errors?.toString();
    }
    public getIrrelevantEntities(): string {
        return this.irrelevantEntities ? JSON.parse(this.irrelevantEntities?.toString()) : '';
    }
}

export enum SnapshotStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
    FAILED = 'FAILED',
}
