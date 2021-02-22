import { PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Chapter } from '../../../shared-resources/entities/chapter';
import { Book } from '../../../shared-resources/entities/book';
import { PolarisTypeORMInjector } from '@enigmatis/polaris-nest';

@Injectable({ scope: Scope.REQUEST })
export class ChapterService {
    private bookRepository: PolarisRepository<Book>;
    private chapterRepository: PolarisRepository<Chapter>;
    constructor(
        @Inject(PolarisTypeORMInjector)
        private readonly polarisTypeORMInjector: PolarisTypeORMInjector,
    ) {
        this.bookRepository = this.polarisTypeORMInjector.getRepository(Book);
        this.chapterRepository = this.polarisTypeORMInjector.getRepository(Chapter);
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
