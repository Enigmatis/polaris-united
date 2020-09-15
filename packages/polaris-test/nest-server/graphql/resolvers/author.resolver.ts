import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import * as AuthorApi from '../entities/author';
import { PolarisLoggerService } from '../../../../polaris-nest/src';
import { Author } from '../../../shared-resources/entities/author';
import { AuthorService } from '../services/author.service';

@Resolver(() => AuthorApi.Author)
export class AuthorResolver {
    constructor(
        private readonly authorService: AuthorService,
        private readonly loggerService: PolarisLoggerService,
    ) {}

    @Query(() => [AuthorApi.Author])
    public async authorsByFirstName(@Args('name') id: string): Promise<Author[]> {
        this.loggerService.debug('in authors by name');
        return this.authorService.findByName(id);
    }
    @Query(() => AuthorApi.Author)
    public async authorsById(@Args('id') id: string): Promise<Author | undefined> {
        return this.authorService.findOneById(id);
    }

    @Mutation(() => AuthorApi.Author)
    public async createAuthor(
        @Args('firstName') firstName: string,
        @Args('lastName') lastName: string,
    ): Promise<Author[] | Author> {
        return this.authorService.create(firstName, lastName);
    }

    @Mutation(() => Boolean)
    public async deleteAuthor(@Args('id') id: string) {
        return this.authorService.deleteAuthor(id);
    }
    @Query(() => [AuthorApi.Author])
    public async authorsByFirstNameFromCustomHeader(): Promise<Author[]> {
        return this.authorService.findByFirstName();
    }
    @Query(() => Number)
    public async customContextCustomField(): Promise<number> {
        return this.authorService.returnCustomField();
    }

    @Query(() => String)
    public async customContextInstanceMethod(): Promise<string> {
        return this.authorService.customContextInstanceMethod();
    }
}
