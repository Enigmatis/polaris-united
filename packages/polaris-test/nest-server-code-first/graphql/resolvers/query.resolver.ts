import { Directive, Mutation, Query } from '@nestjs/graphql';
import { PolarisError } from '../../../../polaris-common/src';

export class QueryResolver {
    @Query(() => String)
    @Directive('@permissions(entityTypes: ["foo"], actions: ["READ", "DELETE"])')
    public async permissionsField(): Promise<string> {
        return 'foo bar baz';
    }
    @Query(() => String)
    @Directive('@permissions(entityTypes: ["bar"], actions: ["READ", "DELETE"])')
    public async permissionsFieldWithHeader(): Promise<string> {
        return 'hello world!';
    }

    @Mutation(() => Boolean)
    public async fail() {
        throw new PolarisError('fail', 404);
    }
}
