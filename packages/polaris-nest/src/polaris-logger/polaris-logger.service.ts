import { Inject, Injectable, LoggerService, Scope } from "@nestjs/common";
import { PolarisGraphQLLogger } from "@enigmatis/polaris-graphql-logger";
import {
  createPolarisLoggerFromPolarisServerConfig,
  PolarisGraphQLContext,
} from "@enigmatis/polaris-core";
import { AbstractPolarisLogger } from "@enigmatis/polaris-logs";
import { CONTEXT } from "@nestjs/graphql";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";
import { PolarisServerConfig } from "@enigmatis/polaris-core/dist/src/config/polaris-server-config";

@Injectable({ scope: Scope.REQUEST })
export class PolarisLoggerService implements LoggerService {
  private polarisLogger: PolarisGraphQLLogger;

  constructor(
    @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext,
    private readonly serverConfigService: PolarisServerConfigService
  ) {
    if (!this.polarisLogger) {
      this.polarisLogger = createPolarisLoggerFromPolarisServerConfig(serverConfigService.getPolarisServerConfig()) as unknown as PolarisGraphQLLogger;
    }
  }
  log(message: string) {
    this.polarisLogger.info(message, this.ctx);
  }

  info(message: string) {
    this.polarisLogger.info(message, this.ctx);
  }

  error(message: string) {
    this.polarisLogger.error(message, this.ctx);
  }

  fatal(message: string) {
    this.polarisLogger.fatal(message, this.ctx);
  }

  warn(message: string) {
    this.polarisLogger.warn(message, this.ctx);
  }

  debug(message: string) {
    this.polarisLogger.debug(message, this.ctx);
  }

  verbose(message: string) {
    this.polarisLogger.trace(message, this.ctx);
  }

  getPolarisLogger(
    serverConfigService?: PolarisServerConfig
  ): AbstractPolarisLogger {
    this.polarisLogger =
      this.polarisLogger ||
      (createPolarisLoggerFromPolarisServerConfig(serverConfigService) as unknown as PolarisGraphQLLogger);
    return (this.polarisLogger as unknown) as AbstractPolarisLogger;
  }
}
