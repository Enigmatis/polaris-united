import { RepositoryEntity } from "../../../../src";
import { Author } from "./author";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType({
  implements: [RepositoryEntity],
})
export class Book extends RepositoryEntity {
  @Field()
  title: String;
  @Field((type) => Author, { nullable: true })
  author: Author;
}
