import { PolarisGraphQLContext, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../../../shared-resources/entities/book';
import { Chapter } from '../../../shared-resources/entities/chapter';

@Injectable({ scope: Scope.REQUEST })
export class ChapterService {
    constructor(
        @InjectRepository(Chapter)
        private readonly chapterRepository: PolarisRepository<Chapter>,
        @InjectRepository(Book)
        private readonly bookRepository: PolarisRepository<Book>,
        @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext,
    ) {}

    public async createChapter(num: number, id?: string): Promise<Chapter> {
        let book;
        if (id) {
            book = await this.bookRepository.findOne(this.ctx, { where: { id } });
        }
        const newChapter = new Chapter(num, book);
        const chapterSaved = await this.chapterRepository.save(this.ctx, newChapter);
        return chapterSaved instanceof Array ? chapterSaved[0] : chapterSaved;
    }
}
