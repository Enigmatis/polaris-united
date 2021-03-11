import { RepositoryEntity } from '@enigmatis/polaris-nest';
import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { Author } from './author';
import { Chapter } from './chapter';
import { Review } from './review';
import { Genre } from './genre';
import { OneToOneEntity } from './one-to-one-entity';

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
    @Field(() => [Review], { nullable: true })
    public reviews: Review[];
    @Field(() => [Genre], { nullable: true })
    public genres: Genre[];
    @Field(() => OneToOneEntity, { nullable: true })
    public oneToOneEntity: OneToOneEntity;
}
