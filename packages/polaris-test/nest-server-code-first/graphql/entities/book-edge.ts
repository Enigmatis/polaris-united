import { Field, ObjectType } from '@nestjs/graphql';
import { Book } from './book';

@ObjectType()
export class BookEdge {
    @Field(() => Book, { nullable: true })
    public node: Book;
    @Field({ nullable: true })
    public cursor: string;
}
