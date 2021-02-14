import { PolarisConnection, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { Author } from '../../../shared-resources/entities/author';
import { Pen } from '../../../shared-resources/entities/pen';
import { TestContext } from '../../../shared-resources/context/test-context';
import { PolarisConnectionInjector } from '@enigmatis/polaris-nest';

@Injectable({ scope: Scope.REQUEST })
export class PenService {
    private authorRepository: PolarisRepository<Author>;
    private penRepository: PolarisRepository<Pen>;
    private connection: PolarisConnection;
    constructor(
        @Inject(PolarisConnectionInjector)
        private readonly polarisConnectionInjector: PolarisConnectionInjector,
        @Inject(CONTEXT) ctx: TestContext,
    ) {
        this.connection = this.polarisConnectionInjector.getConnection();
        this.authorRepository = this.connection.getRepository(Author, ctx);
        this.penRepository = this.connection.getRepository(Pen, ctx);
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
