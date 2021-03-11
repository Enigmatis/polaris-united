import { PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Genre } from '../../../shared-resources/entities/genre';
import { Book } from '../../../shared-resources/entities/book';
import { PolarisTypeORMInjector } from '@enigmatis/polaris-nest';

@Injectable({ scope: Scope.REQUEST })
export class GenreService {
    private bookRepository: PolarisRepository<Book>;
    private genreRepository: PolarisRepository<Genre>;
    constructor(
        @Inject(PolarisTypeORMInjector)
        private readonly polarisTypeORMInjector: PolarisTypeORMInjector,
    ) {
        this.bookRepository = this.polarisTypeORMInjector.getRepository(Book);
        this.genreRepository = this.polarisTypeORMInjector.getRepository(Genre);
    }

    public async createGenre(name: string, id?: string): Promise<Genre | undefined> {
        let book;
        if (id) {
            book = await this.bookRepository.findOne({ where: { id } });
            if (book) {
                const newGenre = new Genre(name, [book]);
                const genreSaved = await this.genreRepository.save(newGenre);
                return genreSaved instanceof Array ? genreSaved[0] : genreSaved;
            }
        }
        return undefined;
    }
}
