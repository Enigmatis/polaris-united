import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class DataVersion {
    @PrimaryColumn()
    private id: number = 1;

    @Column()
    private readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    public getId(): number {
        return this.id;
    }

    public getValue(): number {
        return this.value;
    }
}
