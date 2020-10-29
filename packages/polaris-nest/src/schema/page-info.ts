import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
    @Field({ nullable: true })
    public startCursor: string;
    @Field({ nullable: true })
    public endCursor: string;
    @Field({ nullable: true })
    public hasNextPage: boolean;
    @Field({ nullable: true })
    public hasPreviousPage: boolean;
}
