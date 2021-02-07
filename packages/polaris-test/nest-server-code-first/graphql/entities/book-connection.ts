import { Field, ObjectType } from '@nestjs/graphql';
import { BookEdge } from './book-edge';
import { PageInfoApi } from '@enigmatis/polaris-nest';

@ObjectType()
export class BookConnection {
    @Field(() => PageInfoApi, { nullable: true })
    public pageInfo: PageInfoApi;
    @Field(() => [BookEdge], { nullable: true })
    public edges: BookEdge[];
}
