import { Field, ID, InterfaceType } from "@nestjs/graphql";

@InterfaceType()
export abstract class RepositoryEntity {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  createdBy: string;

  @Field({ nullable: true })
  creationTime: Date;

  @Field({ nullable: true })
  lastUpdatedBy: string;

  @Field({ nullable: true })
  lastUpdateTime: Date;

  @Field()
  realityId: number;
}
