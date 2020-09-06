import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Like, PolarisConnection, PolarisRepository } from '../../../../../src';
import { TestContext } from '../../context/test-context';
import { Author } from '../../dal/models/author';

@Injectable({ scope: Scope.REQUEST })
export class AuthorService {
    constructor(
        @InjectRepository(Author)
        private readonly authorRepository: PolarisRepository<Author>,
        @InjectConnection()
        private readonly connection: PolarisConnection,
        @Inject(CONTEXT) private readonly ctx: TestContext,
    ) {}

    public async create(firstName: string, lastName: string): Promise<Author | Author> {
        const author = new Author(firstName, lastName);
        return ((await this.authorRepository.save(this.ctx, author)) as unknown) as Promise<
            Author | Author
        >;
    }

    public async findOneById(id: string): Promise<Author | undefined> {
        return this.authorRepository.findOne(this.ctx, id);
    }

    public async findOneByName(name: string): Promise<Author | undefined> {
        return this.authorRepository.findOne(this.ctx, name);
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

    public returnCustomField(): number {
        return this.ctx.customField;
    }

    public customContextInstanceMethod(): string {
        return this.ctx.instanceInContext.doSomething();
    }
}
