import { Field, ObjectType } from '@nestjs/graphql';
import { RepositoryEntity } from '../../../../../../polaris-nest/src';
import { Book } from './book';

@ObjectType({
    implements: [RepositoryEntity],
})
export class Author extends RepositoryEntity {
    @Field(type => String)
    public firstName: string;

    @Field({ nullable: true })
    public lastName?: string;

    @Field(type => [Book], { nullable: true })
    public books: Book[];
}
