import { Inject, Injectable, LoggerService, Scope } from "@nestjs/common";
import {
  createPolarisLoggerFromPolarisServerConfig,
  PolarisGraphQLContext,
  PolarisGraphQLLogger,
  AbstractPolarisLogger,
  GraphQLLogProperties,
  PolarisServerConfig,
} from "@enigmatis/polaris-core";
import { CONTEXT } from "@nestjs/graphql";
import { PolarisServerConfigService } from "../polaris-server-config/polaris-server-config.service";

/**
 * levels: verbose < debug < log < warn < error < fatal
 */

@Injectable({ scope: Scope.REQUEST })
export class PolarisLoggerService implements LoggerService {
  private polarisLogger: PolarisGraphQLLogger;

  constructor(
    @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext,
    private readonly serverConfigService: PolarisServerConfigService
  ) {
    if (!this.polarisLogger) {
      this.polarisLogger = (createPolarisLoggerFromPolarisServerConfig(
        serverConfigService.getPolarisServerConfig()
      ) as unknown) as PolarisGraphQLLogger;
    }
  }
  /**
   * Alias to info
   * @param message
   * @param contextOrPolarisLogProperties
   */
  log(
    message: string,
    contextOrPolarisLogProperties?: string | GraphQLLogProperties
  ) {
    if (typeof contextOrPolarisLogProperties === "string") {
      this.info(message, {
        customProperties: { nestJsContext: contextOrPolarisLogProperties },
      });
    } else {
      this.info(message, contextOrPolarisLogProperties);
    }
  }

  private info(message: string, properties?: GraphQLLogProperties) {
    this.polarisLogger.info(message, this.ctx, properties);
  }

  error(
    message: string,
    trace?: string,
    contextOrPolarisLogProperties?: string | GraphQLLogProperties
  ) {
    if (
      (trace && !contextOrPolarisLogProperties) ||
      typeof contextOrPolarisLogProperties === "string"
    ) {
      this.polarisLogger.error(message, this.ctx, {
        customProperties: {
          nestJsContext: contextOrPolarisLogProperties,
          nestJsTrace: trace,
        },
      });
    } else {
      this.polarisLogger.error(
        message,
        this.ctx,
        contextOrPolarisLogProperties
      );
    }
  }

  /**
   * Worse than error
   * @param message
   * @param properties
   */
  fatal(message: string, properties?: GraphQLLogProperties) {
    this.polarisLogger.fatal(message, this.ctx, properties);
  }

  warn(
    message: string,
    contextOrPolarisLogProperties?: string | GraphQLLogProperties
  ) {
    if (typeof contextOrPolarisLogProperties === "string") {
      this.polarisLogger.warn(message, this.ctx, {
        customProperties: { nestJsContext: contextOrPolarisLogProperties },
      });
    } else {
      this.polarisLogger.warn(message, this.ctx, contextOrPolarisLogProperties);
    }
  }

  debug(
    message: string,
    contextOrPolarisLogProperties?: string | GraphQLLogProperties
  ) {
    if (typeof contextOrPolarisLogProperties === "string") {
      this.polarisLogger.debug(message, this.ctx, {
        customProperties: { nestJsContext: contextOrPolarisLogProperties },
      });
    } else {
      this.polarisLogger.debug(
        message,
        this.ctx,
        contextOrPolarisLogProperties
      );
    }
  }

  /**
   * Alias to trace
   * @param message
   * @param contextOrPolarisLogProperties
   */
  verbose(
    message: string,
    contextOrPolarisLogProperties?: string | GraphQLLogProperties
  ) {
    if (typeof contextOrPolarisLogProperties === "string") {
      this.trace(message, {
        customProperties: { nestJsContext: contextOrPolarisLogProperties },
      });
    } else {
      this.trace(message, contextOrPolarisLogProperties);
    }
  }

  private trace(message: string, properties?: GraphQLLogProperties) {
    this.polarisLogger.trace(message, this.ctx, properties);
  }
  getPolarisLogger(
    serverConfigService?: PolarisServerConfig
  ): AbstractPolarisLogger {
    this.polarisLogger =
      this.polarisLogger ||
      ((createPolarisLoggerFromPolarisServerConfig(
        serverConfigService
      ) as unknown) as PolarisGraphQLLogger);
    return (this.polarisLogger as unknown) as AbstractPolarisLogger;
  }
}
