import { Test, TestingModule } from "@nestjs/testing";
import { PolarisGqlModuleOptionsService } from "./polaris-gql-module-options.service";

describe("PolarisGqlModuleOptionsService", () => {
  let service: PolarisGqlModuleOptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolarisGqlModuleOptionsService],
    }).compile();

    service = module.get<PolarisGqlModuleOptionsService>(
      PolarisGqlModuleOptionsService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
