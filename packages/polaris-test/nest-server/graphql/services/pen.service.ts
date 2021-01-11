import { PolarisConnection, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectConnection } from '@nestjs/typeorm';
import { Author } from '../../../shared-resources/entities/author';
import { Pen } from '../../../shared-resources/entities/pen';
import { TestContext } from '../../../shared-resources/context/test-context';

@Injectable({ scope: Scope.REQUEST })
export class PenService {
    constructor(
        private readonly authorRepository: PolarisRepository<Author>,
        private readonly penRepository: PolarisRepository<Pen>,
        @InjectConnection()
        connection: PolarisConnection,
        @Inject(CONTEXT) ctx: TestContext,
    ) {
        this.authorRepository = connection.getRepository(Author, ctx);
        this.penRepository = connection.getRepository(Pen, ctx);
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
