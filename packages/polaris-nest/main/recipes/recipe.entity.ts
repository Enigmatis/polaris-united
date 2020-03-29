import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  CommonModel,
} from "@enigmatis/polaris-typeorm";

@Entity()
export class Recipe extends CommonModel {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  creationDate: Date;

  getId(): string {
    return this.id;
  }
}
