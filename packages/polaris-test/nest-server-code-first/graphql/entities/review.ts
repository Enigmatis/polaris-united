import { Field, InterfaceType, Int, ObjectType } from '@nestjs/graphql';
import { RepositoryEntity } from '@enigmatis/polaris-nest';
import { Book } from './book';

@InterfaceType({
    resolveType: (review) => {
        if (review.site) {
            return ProfessionalReview;
        }
        return SimpleReview;
    },
})
export abstract class Review extends RepositoryEntity {
    @Field(() => Int)
    public rating: number;
    @Field()
    public description: string;
    @Field(() => Book, { nullable: true })
    public book: Book;
}

@ObjectType({ implements: [Review, RepositoryEntity] })
export class ProfessionalReview extends Review {
    @Field()
    public site: string;
}

@ObjectType({ implements: [Review, RepositoryEntity] })
export class SimpleReview extends Review {
    @Field()
    public name: string;
}
