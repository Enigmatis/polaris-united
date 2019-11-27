import { LoggerConfiguration, PolarisLogger, PolarisLogProperties } from '@enigmatis/polaris-logs';
import { GraphQLLogger } from './graphql-logger';
import { ApplicationProperties, PolarisGraphQLContext } from '@enigmatis/polaris-common';

export class PolarisGraphQLLogger implements GraphQLLogger {
    readonly polarisLogger: PolarisLogger;

    constructor(loggerConfig: LoggerConfiguration, applicationProperties: ApplicationProperties) {
        this.polarisLogger = new PolarisLogger(loggerConfig, applicationProperties);
    }

    private static buildLogProperties(
        context?: PolarisGraphQLContext,
        polarisLogProperties: PolarisLogProperties = {},
    ): PolarisLogProperties {
        const contextProperties: PolarisLogProperties | undefined = context &&
            context.requestHeaders && {
                requestId: context.requestHeaders.requestId,
                eventKind: polarisLogProperties.eventKind,
                reality: {
                    id: context.requestHeaders.realityId,
                },
                eventKindDescription: {
                    requestingSystemId: context.requestHeaders.requestingSystemId,
                },
                request: {
                    requestingIp: context.clientIp,
                    requestingUserIdentifier: context.requestHeaders.upn,
                    requestingSystem: {
                        name: context.requestHeaders.requestingSystemName,
                        id: context.requestHeaders.requestingSystemId,
                    },
                },
            };
        return { ...contextProperties, ...polarisLogProperties };
    }

    fatal(
        message: string,
        options?: {
            context?: PolarisGraphQLContext;
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
            context?: PolarisGraphQLContext;
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
            context?: PolarisGraphQLContext;
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
            context?: PolarisGraphQLContext;
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
            context?: PolarisGraphQLContext;
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
            context?: PolarisGraphQLContext;
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

    getPolarisLogger(): PolarisLogger {
        return this.polarisLogger;
    }
}
