import { GraphQLLogProperties } from './graphql-log-properties';
import { PolarisBaseContext } from '@enigmatis/polaris-common';

export interface GraphQLLogger {
    fatal(
        message: string,
        options?: {
            context?: PolarisBaseContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    error(
        message: string,
        options?: {
            context?: PolarisBaseContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    warn(
        message: string,
        options?: {
            context?: PolarisBaseContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    info(
        message: string,
        options?: {
            context?: PolarisBaseContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    trace(
        message: string,
        options?: {
            context?: PolarisBaseContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    debug(
        message: string,
        options?: {
            context?: PolarisBaseContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;
}
