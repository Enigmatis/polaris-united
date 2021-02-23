import { PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { Author } from '../../../shared-resources/entities/author';
import { Pen } from '../../../shared-resources/entities/pen';
import { TestContext } from '../../../shared-resources/context/test-context';
import { PolarisTypeORMInjector } from '@enigmatis/polaris-nest';

@Injectable({ scope: Scope.REQUEST })
export class PenService {
    private authorRepository: PolarisRepository<Author>;
    private penRepository: PolarisRepository<Pen>;
    constructor(
        @Inject(PolarisTypeORMInjector)
        private readonly polarisTypeORMInjector: PolarisTypeORMInjector,
        @Inject(CONTEXT) ctx: TestContext,
    ) {
        this.authorRepository = this.polarisTypeORMInjector.getRepository(Author);
        this.penRepository = this.polarisTypeORMInjector.getRepository(Pen);
    }

    public async createPen(color: string, id?: string): Promise<Pen> {
        let author;
        if (id) {
            author = await this.authorRepository.findOne({ where: { id } });
        }
        const newPen = new Pen(color, author);
        const penSaved = await this.penRepository.save(newPen);
        return penSaved instanceof Array ? penSaved[0] : penSaved;
    }
}
