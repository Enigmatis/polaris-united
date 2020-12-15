import { DeleteResult, Like, PolarisConnection, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TestContext } from '../../../shared-resources/context/test-context';
import { Author } from '../../../shared-resources/entities/author';
import {Book} from "../../../shared-resources/entities/book";

@Injectable({ scope: Scope.REQUEST })
export class AuthorService {
    constructor(
        @InjectRepository(Author)
        private readonly authorRepository: PolarisRepository<Author>,
        @InjectConnection()
        private readonly connection: PolarisConnection,
        @Inject(CONTEXT) private readonly ctx: TestContext,
    ) {}

    public async create(firstName: string, lastName: string): Promise<Author> {
        const author = new Author(firstName, lastName);
        return ((await this.authorRepository.save(this.ctx, author)) as unknown) as Promise<Author>;
    }

    public async findOneById(id: string): Promise<Author | undefined> {
        return this.authorRepository.findOne(this.ctx, id);
    }

    public async findOneByName(name: string): Promise<Author | undefined> {
        return this.authorRepository.findOne(this.ctx, name);
    }

    public async find(): Promise<Author[]> {
        return this.authorRepository.find(this.ctx, {});
    }
    public async findByName(name: string): Promise<Author[]> {
        return this.authorRepository.find(this.ctx, {
            where: { firstName: Like(`%${name}%`) },
        });
    }

    public async findByFirstName(): Promise<Author[]> {
        return this.authorRepository.find(this.ctx, {
            where: { firstName: Like(`%${this.ctx.requestHeaders.customHeader}%`) },
        });
    }

    public async deleteAuthor(id: string): Promise<boolean> {
        const result: DeleteResult = await this.authorRepository.delete(this.ctx, id);
        return (
            result &&
            result.affected !== null &&
            result.affected !== undefined &&
            result.affected > 0
        );
    }

    public async findSortedByDataVersion(): Promise<Author[]> {
        return this.authorRepository.findSortedByDataVersion(this.ctx, {});
    }

    public returnCustomField(): number {
        return this.ctx.customField;
    }

    public customContextInstanceMethod(): string {
        return this.ctx.instanceInContext.doSomething();
    }

    public async totalCount(): Promise<number> {
        return this.authorRepository.count(this.ctx);
    }

    public async onlinePagingTotalCount(): Promise<number> {
        return this.authorRepository.onlinePagingCount(this.ctx);
    }
}
