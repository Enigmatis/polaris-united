import { Field, ObjectType } from "@nestjs/graphql";
import { RepositoryEntity } from "../../../../src";
import { Book } from "./book";

@ObjectType({
  implements: [RepositoryEntity],
})
export class Author extends RepositoryEntity {
  @Field()
  firstName: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field((type) => [Book], { nullable: true })
  books: Book[];
}
