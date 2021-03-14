import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GenreService } from '../services/genre.service';

@Resolver()
export class GenreResolver {
    constructor(private readonly genreService: GenreService) {}

    @Mutation()
    public async createGenre(@Args('name') name: string, @Args('bookId') bookId: string) {
        return this.genreService.createGenre(name, bookId);
    }
}
