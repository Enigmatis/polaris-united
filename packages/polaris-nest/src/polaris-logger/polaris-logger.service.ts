import { Inject, Injectable, LoggerService, Scope } from "@nestjs/common";
import { PolarisGraphQLLogger } from "@enigmatis/polaris-graphql-logger";
import {
  createPolarisLoggerFromPolarisServerConfig,
  PolarisGraphQLContext,
} from "@enigmatis/polaris-core";
import { AbstractPolarisLogger } from "@enigmatis/polaris-logs";
import { CONTEXT } from "@nestjs/graphql";
import { getPolarisServerConfigFromOptions } from "@enigmatis/polaris-core/dist/src/server/configurations-manager";

@Injectable({ scope: Scope.REQUEST })
export class PolarisLoggerService implements LoggerService {
  private polarisLogger: PolarisGraphQLLogger;

  constructor(
    @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext //, //   private readonly serverConfigService: PolarisServerConfigService)
  ) {
    if (!this.polarisLogger) {
      this.polarisLogger = createPolarisLoggerFromPolarisServerConfig(
          getPolarisServerConfigFromOptions(
              {
                typeDefs: [], // BY ANNOTATION
                resolvers: [], // BY ANNOTATION
                port: 8080, //DEFAULT IN SEED
              }
              //optionsService.getPolarisServerOptions()
          )
      ) as PolarisGraphQLLogger;
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

  getPolarisLogger(): AbstractPolarisLogger {
      this.polarisLogger = this.polarisLogger || createPolarisLoggerFromPolarisServerConfig(
        getPolarisServerConfigFromOptions(
            {
              typeDefs: [], // BY ANNOTATION
              resolvers: [], // BY ANNOTATION
              port: 8080, //DEFAULT IN SEED
            }
            //optionsService.getPolarisServerOptions()
        )
    ) as PolarisGraphQLLogger;
      return this.polarisLogger as unknown as AbstractPolarisLogger;
  }
}
