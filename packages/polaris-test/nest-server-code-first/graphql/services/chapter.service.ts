import { PolarisConnection, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { Chapter } from '../../../shared-resources/entities/chapter';
import { TestContext } from '../../../shared-resources/context/test-context';
import { Book } from '../../../shared-resources/entities/book';
import { PolarisConnectionInjector } from '@enigmatis/polaris-nest';

@Injectable({ scope: Scope.REQUEST })
export class ChapterService {
    private bookRepository: PolarisRepository<Book>;
    private chapterRepository: PolarisRepository<Chapter>;
    private connection: PolarisConnection;
    constructor(
        @Inject(PolarisConnectionInjector)
        private readonly polarisConnectionInjector: PolarisConnectionInjector,
        @Inject(CONTEXT) ctx: TestContext,
    ) {
        this.connection = this.polarisConnectionInjector.getConnection();
        this.bookRepository = this.connection.getRepository(Book, ctx);
        this.chapterRepository = this.connection.getRepository(Chapter, ctx);
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
