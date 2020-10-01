import { PolarisGraphQLContext, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from '../../../shared-resources/entities/author';
import { Pen } from '../../../shared-resources/entities/pen';

@Injectable({ scope: Scope.REQUEST })
export class PenService {
    constructor(
        @InjectRepository(Pen)
        private readonly penRepository: PolarisRepository<Pen>,
        @InjectRepository(Author)
        private readonly authorRepository: PolarisRepository<Author>,
        @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext,
    ) {}

    public async createPen(color: string, id?: string): Promise<Pen> {
        let author;
        if (id) {
            author = await this.authorRepository.findOne(this.ctx, { where: { id } });
        }
        const newPen = new Pen(color, author);
        const penSaved = await this.penRepository.save(this.ctx, newPen);
        return penSaved instanceof Array ? penSaved[0] : penSaved;
    }
}
