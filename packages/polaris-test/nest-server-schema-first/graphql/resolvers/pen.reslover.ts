import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PenService } from '../services/pen.service';

@Resolver()
export class PenResolver {
    constructor(private readonly penService: PenService) {}

    @Mutation()
    public async createPen(
        @Args('color') color: string,
        @Args('id', { nullable: true }) authorId: string,
    ) {
        return this.penService.createPen(color, authorId);
    }
}
