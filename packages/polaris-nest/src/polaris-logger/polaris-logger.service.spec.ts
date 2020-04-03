import { Test, TestingModule } from "@nestjs/testing";
import { PolarisLoggerService } from "./polaris-logger.service";

describe("PolarisLoggerService", () => {
  let service: PolarisLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolarisLoggerService],
    }).compile();

    service = module.get<PolarisLoggerService>(PolarisLoggerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
