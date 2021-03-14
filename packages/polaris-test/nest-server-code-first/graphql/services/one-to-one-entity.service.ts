import { PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { OneToOneEntity } from '../../../shared-resources/entities/one-to-one-entity';
import { Book } from '../../../shared-resources/entities/book';
import { PolarisTypeORMInjector } from '@enigmatis/polaris-nest';
import { Genre } from '../../../shared-resources/entities/genre';

@Injectable({ scope: Scope.REQUEST })
export class OneToOneEntityService {
    private bookRepository: PolarisRepository<Book>;
    private genreRepository: PolarisRepository<Genre>;
    private oneToOneEntityRepository: PolarisRepository<OneToOneEntity>;
    constructor(
        @Inject(PolarisTypeORMInjector)
        private readonly polarisTypeORMInjector: PolarisTypeORMInjector,
    ) {
        this.bookRepository = this.polarisTypeORMInjector.getRepository(Book);
        this.genreRepository = this.polarisTypeORMInjector.getRepository(Genre);
        this.oneToOneEntityRepository = this.polarisTypeORMInjector.getRepository(OneToOneEntity);
    }

    public async createOneToOneEntity(
        name: string,
        bookId?: string,
        genreId?: string,
    ): Promise<OneToOneEntity> {
        let book;
        let genre;
        if (bookId) {
            book = await this.bookRepository.findOne({ where: { id: bookId } });
        }
        if (genreId) {
            genre = await this.genreRepository.findOne({ where: { id: genreId } });
        }
        const newOneToOneEntity = new OneToOneEntity(name);
        if (book) {
            newOneToOneEntity.book = book;
        }
        if (genre) {
            newOneToOneEntity.genre = genre;
        }
        const oneToOneEntitySaved = await this.oneToOneEntityRepository.save(newOneToOneEntity);
        return oneToOneEntitySaved instanceof Array ? oneToOneEntitySaved[0] : oneToOneEntitySaved;
    }
}
