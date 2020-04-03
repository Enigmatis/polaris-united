import { Test, TestingModule } from "@nestjs/testing";
import { PolarisServerConfigService } from "./polaris-server-config.service";

describe("PolarisServerConfigService", () => {
  let service: PolarisServerConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolarisServerConfigService],
    }).compile();

    service = module.get<PolarisServerConfigService>(
      PolarisServerConfigService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
