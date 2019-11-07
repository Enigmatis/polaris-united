import {
    ApplicationLogProperties,
    LoggerConfiguration,
    PolarisLogger,
    PolarisLogProperties,
} from '@enigmatis/polaris-logs';
import { GraphQLLogger } from './graphql-logger';

export class PolarisGraphQLLogger<TContext> implements GraphQLLogger<TContext> {
    private polarisLogger: PolarisLogger;

    constructor(
        applicationLogProperties: ApplicationLogProperties,
        loggerConfig: LoggerConfiguration,
    ) {
        this.polarisLogger = new PolarisLogger(applicationLogProperties, loggerConfig);
    }

    private static buildLogProperties(
        context?: any,
        polarisLogProperties: PolarisLogProperties = {},
    ): PolarisLogProperties {
        const contextProperties: PolarisLogProperties | undefined = context &&
            context.headers && {
                requestId: context.headers.requestId,
                upn: context.headers.upn,
                eventKind: context.headers.eventKind,
                reality: {
                    id: context.headers.realityId,
                },
                eventKindDescription: {
                    requestingSystemId: context.headers.requestingSystemId,
                },
                request: {
                    requestingSystem: {
                        name: context.headers.requestingSystemName,
                        id: context.headers.requestingSystemId,
                    },
                },
            };
        return { ...contextProperties, ...polarisLogProperties };
    }

    fatal(
        message: string,
        options?: {
            context?: TContext;
            polarisLogProperties?: PolarisLogProperties;
        },
    ): void {
        this.polarisLogger.fatal(
            message,
            options &&
                PolarisGraphQLLogger.buildLogProperties(
                    options.context,
                    options.polarisLogProperties,
                ),
        );
    }

    error(
        message: string,
        options?: {
            context?: TContext;
            polarisLogProperties?: PolarisLogProperties;
        },
    ): void {
        this.polarisLogger.error(
            message,
            options &&
                PolarisGraphQLLogger.buildLogProperties(
                    options.context,
                    options.polarisLogProperties,
                ),
        );
    }

    warn(
        message: string,
        options?: {
            context?: TContext;
            polarisLogProperties?: PolarisLogProperties;
        },
    ): void {
        this.polarisLogger.warn(
            message,
            options &&
                PolarisGraphQLLogger.buildLogProperties(
                    options.context,
                    options.polarisLogProperties,
                ),
        );
    }

    info(
        message: string,
        options?: {
            context?: TContext;
            polarisLogProperties?: PolarisLogProperties;
        },
    ): void {
        this.polarisLogger.info(
            message,
            options &&
                PolarisGraphQLLogger.buildLogProperties(
                    options.context,
                    options.polarisLogProperties,
                ),
        );
    }

    trace(
        message: string,
        options?: {
            context?: TContext;
            polarisLogProperties?: PolarisLogProperties;
        },
    ): void {
        this.polarisLogger.trace(
            message,
            options &&
                PolarisGraphQLLogger.buildLogProperties(
                    options.context,
                    options.polarisLogProperties,
                ),
        );
    }

    debug(
        message: string,
        options?: {
            context?: TContext;
            polarisLogProperties?: PolarisLogProperties;
        },
    ): void {
        this.polarisLogger.debug(
            message,
            options &&
                PolarisGraphQLLogger.buildLogProperties(
                    options.context,
                    options.polarisLogProperties,
                ),
        );
    }
}
