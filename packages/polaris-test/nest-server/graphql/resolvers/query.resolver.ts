import { Args, Directive, Mutation, Query, Resolver } from '@nestjs/graphql';
import * as AuthorApi from '../entities/author';
import { PolarisLoggerService } from '@enigmatis/polaris-nest';
import { Author } from '../../../shared-resources/entities/author';
import { AuthorService } from '../services/author.service';

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
