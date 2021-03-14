import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OneToOneEntityService } from '../services/one-to-one-entity.service';

@Resolver()
export class OneToOneEntityResolver {
    constructor(private readonly oneToOneEntityService: OneToOneEntityService) {}

    @Mutation()
    public async createOneToOneEntity(
        @Args('name') name: string,
        @Args('bookId', { nullable: true }) bookId: string,
        @Args('genreId', { nullable: true }) genreId: string,
    ) {
        return this.oneToOneEntityService.createOneToOneEntity(name, bookId, genreId);
    }
}
