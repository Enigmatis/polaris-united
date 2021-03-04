import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OnlinePaginatedResolver, PolarisLoggerService } from '@enigmatis/polaris-nest';
import { AuthorService } from '../services/author.service';
import { Author } from '../../../shared-resources/entities/author';
@Resolver()
export class AuthorResolver {
    constructor(
        private readonly authorService: AuthorService,
        private readonly loggerService: PolarisLoggerService,
    ) {}

    @Query()
    public async authors(): Promise<Author[]> {
        return (await this.authorService.find()) as any;
    }
    @Query()
    public async authorsByFirstName(@Args('name') id: string): Promise<Author[]> {
        this.loggerService.debug('in authors by name');
        return this.authorService.findByName(id);
    }
    @Query()
    public async authorById(@Args('id') id: string): Promise<Author | undefined> {
        return this.authorService.findOneById(id);
    }

    @Mutation(() => Boolean)
    public async createManyAuthors(): Promise<boolean> {
        return this.authorService.createManyAuthors();
    }
    @Mutation()
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
    @Query()
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

    @Query()
    public async onlinePaginatedAuthors(): Promise<OnlinePaginatedResolver<Author>> {
        return {
            getData: (): Promise<Author[]> => {
                return this.authorService.findSortedByDataVersion();
            },
        };
    }

    @Query()
    public async onlinePaginatedAuthorsWithInnerJoin(): Promise<OnlinePaginatedResolver<Author>> {
        return {
            getData: (): Promise<Author[]> => {
                return this.authorService.findWithInnerJoin();
            },
        };
    }
}
