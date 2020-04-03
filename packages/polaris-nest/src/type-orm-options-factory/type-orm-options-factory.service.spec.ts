import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmOptionsFactoryService } from "./type-orm-options-factory.service";

describe("TypeOrmOptionsFactoryService", () => {
  let service: TypeOrmOptionsFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeOrmOptionsFactoryService],
    }).compile();

    service = module.get<TypeOrmOptionsFactoryService>(
      TypeOrmOptionsFactoryService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
