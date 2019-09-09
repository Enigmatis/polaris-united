import {GraphQLLogProperties} from './graphql-log-properties';

export interface GraphQLLogger<TContext = object> {
    fatal(
        message: string,
        options?: {
            context?: TContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    error(
        message: string,
        options?: {
            context?: TContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    warn(
        message: string,
        options?: {
            context?: TContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    info(
        message: string,
        options?: {
            context?: TContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    trace(
        message: string,
        options?: {
            context?: TContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;

    debug(
        message: string,
        options?: {
            context?: TContext;
            graphqlLogProperties?: GraphQLLogProperties;
        },
    ): void;
}
