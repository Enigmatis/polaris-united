import { LoggerConfiguration, PolarisLogger, PolarisLogProperties } from '@enigmatis/polaris-logs';
import { ApplicationProperties, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { GraphQLLogProperties } from './graphql-log-properties';

export class PolarisGraphQLLogger extends PolarisLogger {
    constructor(loggerConfig: LoggerConfiguration, applicationProperties?: ApplicationProperties) {
        super(loggerConfig, applicationProperties);
    }

    private static buildLog(
        context: PolarisGraphQLContext,
        polarisLogProperties?: PolarisLogProperties,
    ): GraphQLLogProperties {
        const contextProperties: GraphQLLogProperties | undefined = {
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
                requestQuery: {
                    query: context?.request?.query,
                    operationName: context?.request?.operationName,
                    variables: context?.request?.polarisVariables,
                },
                requestingHost: polarisLogProperties?.request?.requestingHost,
            },
            response: context?.response,
        };
        return { ...contextProperties, ...polarisLogProperties };
    }

    warn(message: string, context: any, graphqlLogProperties?: GraphQLLogProperties): void {
        super.warn(
            message,
            PolarisGraphQLLogger.buildLog(context as PolarisGraphQLContext, graphqlLogProperties),
        );
    }

    info(message: string, context: any, graphqlLogProperties?: GraphQLLogProperties): void {
        super.info(
            message,
            PolarisGraphQLLogger.buildLog(context as PolarisGraphQLContext, graphqlLogProperties),
        );
    }

    error(message: string, context: any, graphqlLogProperties?: GraphQLLogProperties): void {
        super.error(
            message,
            PolarisGraphQLLogger.buildLog(context as PolarisGraphQLContext, graphqlLogProperties),
        );
    }

    trace(message: string, context: any, graphqlLogProperties?: GraphQLLogProperties): void {
        super.trace(
            message,
            PolarisGraphQLLogger.buildLog(context as PolarisGraphQLContext, graphqlLogProperties),
        );
    }

    debug(message: string, context: any, graphqlLogProperties?: GraphQLLogProperties): void {
        super.debug(
            message,
            PolarisGraphQLLogger.buildLog(context as PolarisGraphQLContext, graphqlLogProperties),
        );
    }

    fatal(message: string, context: any, graphqlLogProperties?: GraphQLLogProperties): void {
        super.fatal(
            message,
            PolarisGraphQLLogger.buildLog(context as PolarisGraphQLContext, graphqlLogProperties),
        );
    }
}
