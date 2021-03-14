import { RepositoryEntity } from '@enigmatis/polaris-nest';
import { Field, ObjectType } from '@nestjs/graphql';
import { Book } from './book';
import { OneToOneEntity } from './one-to-one-entity';

@ObjectType({
    implements: [RepositoryEntity],
})
export class Genre extends RepositoryEntity {
    @Field()
    public name: string;
    @Field(() => [Book], { nullable: true })
    public books: Book[];
    @Field(() => OneToOneEntity, { nullable: true })
    public oneToOneEntity: OneToOneEntity;
}
