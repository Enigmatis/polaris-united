import { RepositoryEntity } from '@enigmatis/polaris-nest';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Book } from './book';

@ObjectType({
    implements: [RepositoryEntity],
})
export class Chapter extends RepositoryEntity {
    @Field(() => Int)
    public number: number;
    @Field(() => Book, { nullable: true })
    public book: Book;
}
