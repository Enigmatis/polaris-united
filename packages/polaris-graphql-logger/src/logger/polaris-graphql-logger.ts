import { LoggerConfiguration, PolarisLogger, PolarisLogProperties } from '@enigmatis/polaris-logs';
import { ApplicationProperties, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { GraphQLLogProperties } from './graphql-log-properties';

export class PolarisGraphQLLogger extends PolarisLogger {
    constructor(loggerConfig: LoggerConfiguration, applicationProperties: ApplicationProperties) {
        super(loggerConfig, applicationProperties);
    }

    public static buildLogProperties(
        context?: PolarisGraphQLContext,
        polarisLogProperties: PolarisLogProperties = {},
    ): GraphQLLogProperties {
        const contextProperties: GraphQLLogProperties | undefined = {
            operationName: context?.request?.operationName,
            messageId: context?.requestHeaders?.requestId,
            eventKind: polarisLogProperties?.eventKind,
            reality: {
                id: context?.requestHeaders?.realityId,
                type: polarisLogProperties?.reality?.type,
                name: polarisLogProperties?.reality?.name,
            },
            eventKindDescription: {
                requestingSystemId: context?.requestHeaders?.requestingSystemId,
            },
            request: {
                requestingIp: context?.clientIp,
                requestingUserIdentifier: context?.requestHeaders?.upn,
                requestingSystem: {
                    name: context?.requestHeaders?.requestingSystemName,
                    id: context?.requestHeaders?.requestingSystemId,
                },
                requestQuery: context?.request?.query,
                requestingHost: polarisLogProperties?.request?.requestingHost,
            },
        };
        return { ...contextProperties, ...polarisLogProperties };
    }

    warn(message: string, graphqlLogProperties?: GraphQLLogProperties): void {
        super.warn(message, graphqlLogProperties);
    }

    info(message: string, graphqlLogProperties?: GraphQLLogProperties): void {
        super.info(message, graphqlLogProperties);
    }

    error(message: string, graphqlLogProperties?: GraphQLLogProperties): void {
        super.error(message, graphqlLogProperties);
    }

    trace(message: string, graphqlLogProperties?: GraphQLLogProperties): void {
        super.trace(message, graphqlLogProperties);
    }

    debug(message: string, graphqlLogProperties?: GraphQLLogProperties): void {
        super.debug(message, graphqlLogProperties);
    }

    fatal(message: string, graphqlLogProperties?: GraphQLLogProperties): void {
        super.fatal(message, graphqlLogProperties);
    }
}
