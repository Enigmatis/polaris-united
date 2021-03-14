import { Args, Mutation, Resolver } from '@nestjs/graphql';
import * as GenreApi from '../entities/genre';
import { GenreService } from '../services/genre.service';

@Resolver(() => GenreApi.Genre)
export class GenreResolver {
    constructor(private readonly genreService: GenreService) {}

    @Mutation(() => GenreApi.Genre)
    public async createGenre(@Args('name') name: string, @Args('bookId') bookId: string) {
        return this.genreService.createGenre(name, bookId);
    }
}
