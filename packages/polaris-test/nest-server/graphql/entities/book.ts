import { RepositoryEntity } from '@enigmatis/polaris-nest';
import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { Author } from './author';
import { Chapter } from './chapter';

@ObjectType({
    implements: [RepositoryEntity],
})
export class Book extends RepositoryEntity {
    @Field()
    public title: string;
    @Field(() => Author, { nullable: true })
    public author: Author;
    @Directive('@upper')
    @Field()
    public coverColor: string;
    @Field(() => [Chapter], { nullable: true })
    public chapters: Chapter[];
}
