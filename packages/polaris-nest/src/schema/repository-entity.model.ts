import { Field, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class RepositoryEntity {
    @Field(() => String)
    public id: string;

    @Field({ nullable: true })
    public createdBy: string;

    @Field({ nullable: true })
    public creationTime: Date;

    @Field({ nullable: true })
    public lastUpdatedBy: string;

    @Field({ nullable: true })
    public lastUpdateTime: Date;

    @Field()
    public realityId: number;

    @Field()
    public dataVersion: number;
}
