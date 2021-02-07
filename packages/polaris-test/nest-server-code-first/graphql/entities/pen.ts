import { RepositoryEntity } from '@enigmatis/polaris-nest';
import { Field, ObjectType } from '@nestjs/graphql';
import { Author } from './author';

@ObjectType({
    implements: [RepositoryEntity],
})
export class Pen extends RepositoryEntity {
    @Field()
    public color: string;
    @Field(() => Author, { nullable: true })
    public author: Author;
}
