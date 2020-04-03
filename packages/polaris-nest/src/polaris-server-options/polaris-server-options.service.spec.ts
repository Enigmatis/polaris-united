import { Test, TestingModule } from "@nestjs/testing";
import { PolarisServerOptionsService } from "./polaris-server-options.service";

describe("PolarisServerOptionsService", () => {
  let service: PolarisServerOptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolarisServerOptionsService],
    }).compile();

    service = module.get<PolarisServerOptionsService>(
      PolarisServerOptionsService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
