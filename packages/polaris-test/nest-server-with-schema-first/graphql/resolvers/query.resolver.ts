import { Directive, Query } from '@nestjs/graphql';

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
}
