import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { ChapterService } from '../services/chapter.service';

@Resolver()
export class ChapterResolver {
    constructor(private readonly chapterService: ChapterService) {}

    @Mutation()
    public async createChapter(
        @Args({ name: 'number', type: () => Int }) num: number,
        @Args('bookId') bookId: string,
    ) {
        return this.chapterService.createChapter(num, bookId);
    }
}
