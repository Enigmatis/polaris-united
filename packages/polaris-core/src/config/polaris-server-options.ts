import { RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { ApplicationProperties, LoggerConfiguration } from '@enigmatis/polaris-logs';
import { ConnectionlessConfiguration } from '@enigmatis/polaris-middlewares';
import { PolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import { GqlModuleOptions } from '@nestjs/graphql';
import { ApolloServerExpressConfig } from 'apollo-server-express';
import { DocumentNode } from 'graphql';
import { IResolvers } from 'graphql-tools';
import { ExpressContext, MiddlewareConfiguration } from '..';
import { PermissionsConfiguration } from './permissions-configuration';
import { SnapshotConfiguration } from './snapshot-configuration';

export interface PolarisServerOptions extends PolarisCoreOptions {
    typeDefs: DocumentNode | DocumentNode[] | string | string[];
    resolvers: IResolvers | IResolvers[];
}

export interface PolarisCoreOptions extends Omit<ApolloServerExpressConfig, 'logger'> {
    port: number;
    maxPageSize?: number;
    applicationProperties?: ApplicationProperties;
    logger?: LoggerConfiguration | PolarisGraphQLLogger;
    middlewareConfiguration?: MiddlewareConfiguration;
    allowSubscription?: boolean;
    customMiddlewares?: any[];
    customContext?: (context: ExpressContext) => any;
    supportedRealities?: RealitiesHolder;
    shouldAddWarningsToExtensions?: boolean;
    allowMandatoryHeaders?: boolean;
    snapshotConfig?: SnapshotConfiguration;
    connectionManager?: PolarisConnectionManager;
    enableFederation?: boolean;
    permissionsConfig?: PermissionsConfiguration;
    enableDataVersionFilter?: boolean;
    connectionlessConfiguration?: ConnectionlessConfiguration;
}

export interface PolarisNestSchemaFirstOptions extends PolarisCoreOptions {
    gqlModuleOptions: GqlModuleOptions;
}

export interface PolarisNestCodeFirstOptions extends PolarisCoreOptions {
    autoSchemaFile: boolean;
}
