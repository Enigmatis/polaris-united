import { DeleteResult, Like, PolarisConnection, PolarisRepository } from '@enigmatis/polaris-core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectConnection } from '@nestjs/typeorm';
import { TestContext } from '../../../shared-resources/context/test-context';
import { Author } from '../../../shared-resources/entities/author';

@Injectable({ scope: Scope.REQUEST })
export class AuthorService {
    private authorRepository: PolarisRepository<Author>;
    constructor(
        @InjectConnection()
        connection: PolarisConnection,
        @Inject(CONTEXT) private readonly ctx: TestContext,
    ) {
        this.authorRepository = connection.getRepository(Author, ctx);
    }

    public async create(firstName: string, lastName: string): Promise<Author> {
        const author = new Author(firstName, lastName);
        return ((await this.authorRepository.save(author)) as unknown) as Promise<Author>;
    }

    public async createManyAuthors(): Promise<boolean> {
        for (let i = 0; i < 15; i++) {
            const author = new Author(`Ron${i}`, 'Katz');
            await this.authorRepository.save(author);
        }
        return true;
    }

    public async findOneById(id: string): Promise<Author | undefined> {
        return this.authorRepository.findOne(id);
    }

    public async findOneByName(name: string): Promise<Author | undefined> {
        return this.authorRepository.findOne(name);
    }

    public async find(): Promise<Author[]> {
        return this.authorRepository.find({});
    }
    public async findByName(name: string): Promise<Author[]> {
        return this.authorRepository.find({
            where: { firstName: Like(`%${name}%`) },
        });
    }

    public async findByFirstName(): Promise<Author[]> {
        return this.authorRepository.find({
            where: { firstName: Like(`%${this.ctx.requestHeaders.customHeader}%`) },
        });
    }

    public async deleteAuthor(id: string): Promise<boolean> {
        const result: DeleteResult = await this.authorRepository.delete(id);
        return (
            result &&
            result.affected !== null &&
            result.affected !== undefined &&
            result.affected > 0
        );
    }

    public async findSortedByDataVersion(): Promise<Author[]> {
        return this.authorRepository.findSortedByDataVersion({});
    }

    public returnCustomField(): number {
        return this.ctx.customField;
    }

    public customContextInstanceMethod(): string {
        return this.ctx.instanceInContext.doSomething();
    }

    public async totalCount(): Promise<number> {
        return this.authorRepository.count();
    }
}
