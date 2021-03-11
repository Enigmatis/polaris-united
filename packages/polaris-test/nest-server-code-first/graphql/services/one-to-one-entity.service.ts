import { PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { OneToOneEntity } from '../../../shared-resources/entities/one-to-one-entity';
import { Book } from '../../../shared-resources/entities/book';
import { PolarisTypeORMInjector } from '@enigmatis/polaris-nest';

@Injectable({ scope: Scope.REQUEST })
export class OneToOneEntityService {
    private bookRepository: PolarisRepository<Book>;
    private oneToOneEntityRepository: PolarisRepository<OneToOneEntity>;
    constructor(
        @Inject(PolarisTypeORMInjector)
        private readonly polarisTypeORMInjector: PolarisTypeORMInjector,
    ) {
        this.bookRepository = this.polarisTypeORMInjector.getRepository(Book);
        this.oneToOneEntityRepository = this.polarisTypeORMInjector.getRepository(OneToOneEntity);
    }

    public async createOneToOneEntity(
        name: string,
        id?: string,
    ): Promise<OneToOneEntity | undefined> {
        let book;
        if (id) {
            book = await this.bookRepository.findOne({ where: { id } });
            if (book) {
                const newOneToOneEntity = new OneToOneEntity(name, book, undefined);
                const oneToOneEntitySaved = await this.oneToOneEntityRepository.save(
                    newOneToOneEntity,
                );
                return oneToOneEntitySaved instanceof Array
                    ? oneToOneEntitySaved[0]
                    : oneToOneEntitySaved;
            }
        }
        return undefined;
    }
}
