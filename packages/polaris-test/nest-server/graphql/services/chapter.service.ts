import { PolarisConnection, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectConnection } from '@nestjs/typeorm';
import { Book } from '../../../shared-resources/entities/book';
import { Chapter } from '../../../shared-resources/entities/chapter';
import { TestContext } from '../../../shared-resources/context/test-context';

@Injectable({ scope: Scope.REQUEST })
export class ChapterService {
    constructor(
        private readonly bookRepository: PolarisRepository<Book>,
        private readonly chapterRepository: PolarisRepository<Chapter>,
        @InjectConnection()
        connection: PolarisConnection,
        @Inject(CONTEXT) ctx: TestContext,
    ) {
        this.bookRepository = connection.getRepository(Book, ctx);
        this.chapterRepository = connection.getRepository(Chapter, ctx);
    }

    public async createChapter(num: number, id?: string): Promise<Chapter> {
        let book;
        if (id) {
            book = await this.bookRepository.findOne({ where: { id } });
        }
        const newChapter = new Chapter(num, book);
        const chapterSaved = await this.chapterRepository.save(newChapter);
        return chapterSaved instanceof Array ? chapterSaved[0] : chapterSaved;
    }
}
