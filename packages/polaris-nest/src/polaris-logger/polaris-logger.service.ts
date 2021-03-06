import {
    AbstractPolarisLogger,
    createPolarisLoggerFromPolarisServerOptions,
    GraphQLLogProperties,
    PolarisGraphQLContext,
    PolarisGraphQLLogger,
    PolarisServerConfig,
} from '@enigmatis/polaris-core';
import { Inject, Injectable, LoggerService, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { PolarisServerConfigService } from '../polaris-server-config/polaris-server-config.service';

/**
 * levels: verbose < debug < log < warn < error < fatal
 */

@Injectable({ scope: Scope.REQUEST })
export class PolarisLoggerService implements LoggerService {
    public declare polarisLogger: PolarisGraphQLLogger;

    constructor(
        @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext,
        private readonly serverConfigService: PolarisServerConfigService,
    ) {
        if (!this.polarisLogger) {
            this.polarisLogger = (createPolarisLoggerFromPolarisServerOptions(
                serverConfigService.getPolarisServerConfig().logger,
                this.serverConfigService.getPolarisServerConfig().applicationProperties,
            ) as unknown) as PolarisGraphQLLogger;
        }
    }
    /**
     * Alias to info
     * @param message
     * @param contextOrPolarisLogProperties
     */
    public log(message: string, contextOrPolarisLogProperties?: string | GraphQLLogProperties) {
        if (typeof contextOrPolarisLogProperties === 'string') {
            this.info(message, {
                customProperties: { nestJsContext: contextOrPolarisLogProperties },
            });
        } else {
            this.info(message, contextOrPolarisLogProperties);
        }
    }

    public error(
        message: string,
        trace?: string,
        contextOrPolarisLogProperties?: string | GraphQLLogProperties,
    ) {
        if (
            (trace && !contextOrPolarisLogProperties) ||
            typeof contextOrPolarisLogProperties === 'string'
        ) {
            this.polarisLogger.error(message, this.ctx, {
                customProperties: {
                    nestJsContext: contextOrPolarisLogProperties,
                    nestJsTrace: trace,
                },
            });
        } else {
            this.polarisLogger.error(message, this.ctx, contextOrPolarisLogProperties);
        }
    }

    /**
     * Worse than error
     * @param message
     * @param properties
     */
    public fatal(message: string, properties?: GraphQLLogProperties) {
        this.polarisLogger.fatal(message, this.ctx, properties);
    }

    public warn(message: string, contextOrPolarisLogProperties?: string | GraphQLLogProperties) {
        if (typeof contextOrPolarisLogProperties === 'string') {
            this.polarisLogger.warn(message, this.ctx, {
                customProperties: { nestJsContext: contextOrPolarisLogProperties },
            });
        } else {
            this.polarisLogger.warn(message, this.ctx, contextOrPolarisLogProperties);
        }
    }

    public debug(message: string, contextOrPolarisLogProperties?: string | GraphQLLogProperties) {
        if (typeof contextOrPolarisLogProperties === 'string') {
            this.polarisLogger.debug(message, this.ctx, {
                customProperties: { nestJsContext: contextOrPolarisLogProperties },
            });
        } else {
            this.polarisLogger.debug(message, this.ctx, contextOrPolarisLogProperties);
        }
    }

    /**
     * Alias to trace
     * @param message
     * @param contextOrPolarisLogProperties
     */
    public verbose(message: string, contextOrPolarisLogProperties?: string | GraphQLLogProperties) {
        if (typeof contextOrPolarisLogProperties === 'string') {
            this.trace(message, {
                customProperties: { nestJsContext: contextOrPolarisLogProperties },
            });
        } else {
            this.trace(message, contextOrPolarisLogProperties);
        }
    }
    public getPolarisLogger(serverConfigService?: PolarisServerConfig): AbstractPolarisLogger {
        this.polarisLogger =
            this.polarisLogger ||
            ((createPolarisLoggerFromPolarisServerOptions(
                serverConfigService!.logger,
                serverConfigService!.applicationProperties,
            ) as unknown) as PolarisGraphQLLogger);
        return (this.polarisLogger as unknown) as AbstractPolarisLogger;
    }

    private info(message: string, properties?: GraphQLLogProperties) {
        this.polarisLogger.info(message, this.ctx, properties);
    }

    private trace(message: string, properties?: GraphQLLogProperties) {
        this.polarisLogger.trace(message, this.ctx, properties);
    }
}
