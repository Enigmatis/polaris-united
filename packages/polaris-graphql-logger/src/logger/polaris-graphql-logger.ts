import {
    AbstractPolarisLogger,
    LoggerConfiguration,
    PolarisLogProperties,
} from '@enigmatis/polaris-logs';
import { ApplicationProperties, PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { GraphQLLogProperties } from './graphql-log-properties';

export class PolarisGraphQLLogger extends AbstractPolarisLogger {
    public constructor(
        loggerConfiguration: LoggerConfiguration,
        applicationLogProperties?: ApplicationProperties,
    ) {
        super(loggerConfiguration, applicationLogProperties);
    }
    public fatal(
        message: string,
        context: PolarisGraphQLContext,
        graphQLLogProperties?: GraphQLLogProperties,
    ) {
        this.logger.fatal(this.buildGraphQLLog(message, context, graphQLLogProperties));
    }

    public error(
        message: string,
        context: PolarisGraphQLContext,
        graphQLLogProperties?: GraphQLLogProperties,
    ) {
        this.logger.error(this.buildGraphQLLog(message, context, graphQLLogProperties));
    }

    public warn(
        message: string,
        context: PolarisGraphQLContext,
        graphQLLogProperties?: GraphQLLogProperties,
    ) {
        this.logger.warn(this.buildGraphQLLog(message, context, graphQLLogProperties));
    }

    public info(
        message: string,
        context: PolarisGraphQLContext,
        graphQLLogProperties?: GraphQLLogProperties,
    ) {
        this.logger.info(this.buildGraphQLLog(message, context, graphQLLogProperties));
    }

    public debug(
        message: string,
        context: PolarisGraphQLContext,
        graphQLLogProperties?: GraphQLLogProperties,
    ) {
        this.logger.debug(this.buildGraphQLLog(message, context, graphQLLogProperties));
    }

    public trace(
        message: string,
        context: PolarisGraphQLContext,
        graphQLLogProperties?: GraphQLLogProperties,
    ) {
        this.logger.trace(this.buildGraphQLLog(message, context, graphQLLogProperties));
    }

    private buildGraphQLLog(
        message: string,
        context: PolarisGraphQLContext,
        graphQLLogProperties?: GraphQLLogProperties,
    ): GraphQLLogProperties {
        const basicLogProperties = this.buildLog(message, graphQLLogProperties);

        const contextLogProperties = {
            messageId: context?.requestHeaders?.requestId,
            eventKind: graphQLLogProperties?.eventKind,
            reality: {
                id: context?.requestHeaders?.realityId,
                type: graphQLLogProperties?.reality?.type,
                name: graphQLLogProperties?.reality?.name,
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
                requestingHost: graphQLLogProperties?.request?.requestingHost,
            },
            response: context?.response,
        };

        return { ...basicLogProperties, ...contextLogProperties };
    }
}
