import { RepositoryEntity } from '@enigmatis/polaris-nest';
import { Field, ObjectType } from '@nestjs/graphql';
import { Book } from './book';

@ObjectType({
    implements: [RepositoryEntity],
})
export class Genre extends RepositoryEntity {
    @Field()
    public name: string;
    @Field(() => [Book], { nullable: true })
    public books: Book[];
}
