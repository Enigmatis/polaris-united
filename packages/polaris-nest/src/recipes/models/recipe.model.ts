import { Field, ID, ObjectType } from "@nestjs/graphql";
import { RepositoryEntity } from "../../schema/repository-entity.model";

@ObjectType({
  implements: [RepositoryEntity],
})
export class RecipeModel implements RepositoryEntity {
  @Field((type) => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  createdBy: string;

  creationTime: Date;

  @Field({ nullable: true })
  lastUpdateTime: Date;

  @Field({ nullable: true })
  lastUpdatedBy: string;

  realityId: number;
}
