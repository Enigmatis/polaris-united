import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import * as ChapterApi from '../entities/chapter';
import { ChapterService } from '../services/chapter.service';

@Resolver(() => ChapterApi.Chapter)
export class ChapterResolver {
    constructor(private readonly chapterService: ChapterService) {}

    @Mutation(() => ChapterApi.Chapter)
    public async createChapter(
        @Args({ name: 'number', type: () => Int }) num: number,
        @Args('bookId') bookId: string,
    ) {
        return this.chapterService.createChapter(num, bookId);
    }
}
