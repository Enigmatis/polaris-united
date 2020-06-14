import { Inject, Injectable, Scope } from "@nestjs/common";
import {
  Like,
  PolarisConnection,
  PolarisRepository,
  DeleteResult,
} from "@enigmatis/polaris-core";
import { CONTEXT } from "@nestjs/graphql";
import { Author } from "../../dal/models/author";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { TestContext } from "../../context/test-context";

@Injectable({ scope: Scope.REQUEST })
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: PolarisRepository<Author>,
    @InjectConnection()
    private readonly connection: PolarisConnection,
    @Inject(CONTEXT) private readonly ctx: TestContext
  ) {}

  async create(firstName: string, lastName: string): Promise<Author | Author> {
    const author = new Author(firstName, lastName);
    return ((await this.authorRepository.save(
      this.ctx,
      author
    )) as unknown) as Promise<Author | Author>;
  }

  async findOneById(id: string): Promise<Author> {
    return this.authorRepository.findOne(this.ctx, id);
  }

  async findOneByName(name: string): Promise<Author> {
    return this.authorRepository.findOne(this.ctx, name);
  }

  async findByName(name: string): Promise<Author[]> {
    return this.authorRepository.find(this.ctx, {
      where: { firstName: Like(`%${name}%`) },
    });
  }

  async findByFirstName(): Promise<Author[]> {
    return this.authorRepository.find(this.ctx, {
      where: { firstName: Like(`%${this.ctx.requestHeaders.customHeader}%`) },
    });
  }

  async deleteAuthor(id: string): Promise<boolean> {
    const result: DeleteResult = await this.authorRepository.delete(
      this.ctx,
      id
    );
    return (
      result &&
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }

  returnCustomField(): number {
    return this.ctx.customField;
  }

  customContextInstanceMethod(): string {
    return this.ctx.instanceInContext.doSomething();
  }
}
