import { RepositoryEntity } from '@enigmatis/polaris-nest';
import { Field, ObjectType } from '@nestjs/graphql';
import { Book } from './book';
import { Genre } from './genre';

@ObjectType({
    implements: [RepositoryEntity],
})
export class OneToOneEntity extends RepositoryEntity {
    @Field()
    public name: string;
    @Field(() => Book, { nullable: true })
    public books: Book;
    @Field(() => Genre, { nullable: true })
    public genre: Genre;
}
