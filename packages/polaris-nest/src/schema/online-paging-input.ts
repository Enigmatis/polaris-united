import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OnlinePagingInput {
    @Field({ nullable: true })
    first: number;
    @Field({ nullable: true })
    last: number;
    @Field({ nullable: true })
    after: string;
    @Field({ nullable: true })
    before: string;
}
