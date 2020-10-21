import { RepositoryEntity } from '@enigmatis/polaris-nest';
import { Field, ObjectType } from '@nestjs/graphql';
import { Book } from './book';
import { Pen } from './pen';

@ObjectType({
    implements: [RepositoryEntity],
})
export class Author extends RepositoryEntity {
    @Field(() => String)
    public firstName: string;

    @Field({ nullable: true })
    public lastName?: string;

    @Field(() => [Book], { nullable: true })
    public books: Book[];

    @Field(() => [Pen], { nullable: true })
    public pens: Pen[];
}
