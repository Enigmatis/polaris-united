import { Args, Mutation, Resolver } from '@nestjs/graphql';
import * as PenApi from '../entities/pen';
import { PenService } from '../services/pen.service';

@Resolver(() => PenApi.Pen)
export class PenResolver {
    constructor(private readonly penService: PenService) {}

    @Mutation(() => PenApi.Pen)
    public async createPen(
        @Args('color') color: string,
        @Args('id', { nullable: true }) authorId: string,
    ) {
        return this.penService.createPen(color, authorId);
    }
}
