import { Field, ID, InterfaceType, ObjectType } from "@nestjs/graphql";

@InterfaceType()
export abstract class RepositoryEntity {
  @Field((type) => ID)
  id: string;

  createdBy: string;

  creationTime: Date;

  @Field({ nullable: true })
  lastUpdatedBy: string;

  @Field({ nullable: true })
  lastUpdateTime: Date;

  realityId: number;
}
