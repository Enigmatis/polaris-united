import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ReviewKind {
    @Field({ nullable: true })
    name: string;
    @Field({ nullable: true })
    site: string;
}
