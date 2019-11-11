import { GraphQLLogProperties } from './graphql-log-properties';
import { PolarisGraphQLContext } from '@enigmatis/polaris-common';

export interface GraphQLLogger {
    fatal(
        message: string,
        options?: {
            context?: PolarisGraphQLContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    error(
        message: string,
        options?: {
            context?: PolarisGraphQLContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    warn(
        message: string,
        options?: {
            context?: PolarisGraphQLContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    info(
        message: string,
        options?: {
            context?: PolarisGraphQLContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    trace(
        message: string,
        options?: {
            context?: PolarisGraphQLContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    debug(
        message: string,
        options?: {
            context?: PolarisGraphQLContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;
}
