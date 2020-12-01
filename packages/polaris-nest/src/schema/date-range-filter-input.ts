import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DateRangeFilterInput {
    @Field({ nullable: true })
    gt: string;
    @Field({ nullable: true })
    gte: string;
    @Field({ nullable: true })
    lt: string;
    @Field({ nullable: true })
    lte: string;
}
