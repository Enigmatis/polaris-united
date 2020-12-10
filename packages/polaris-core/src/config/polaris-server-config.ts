import { RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { ApplicationProperties } from '@enigmatis/polaris-logs';
import { ConnectionlessConfiguration } from '@enigmatis/polaris-middlewares';
import { PolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import { ApolloServerExpressConfig } from 'apollo-server-express';
import { DocumentNode } from 'graphql';
import { IResolvers } from 'graphql-tools';
import { ExpressContext } from '..';
import { MiddlewareConfiguration } from '../index';
import { PermissionsConfiguration } from './permissions-configuration';
import { SnapshotConfiguration } from './snapshot-configuration';
import { PagingConfiguration } from './paging-configuration';

export interface PolarisServerConfig extends Omit<ApolloServerExpressConfig, 'logger'> {
    typeDefs: DocumentNode | DocumentNode[] | string | string[];
    resolvers: IResolvers | IResolvers[];
    port: number;
    applicationProperties: ApplicationProperties;
    logger: PolarisGraphQLLogger;
    middlewareConfiguration: MiddlewareConfiguration;
    allowSubscription: boolean;
    customMiddlewares?: any[];
    customContext?: (context: ExpressContext) => any;
    supportedRealities: RealitiesHolder;
    shouldAddWarningsToExtensions: boolean;
    allowMandatoryHeaders: boolean;
    snapshotConfig: SnapshotConfiguration;
    pagingConfig: PagingConfiguration;
    connectionManager?: PolarisConnectionManager;
    enableFederation: boolean;
    permissionsConfig: PermissionsConfiguration;
    enableDataVersionFilter: boolean;
    connectionlessConfiguration?: ConnectionlessConfiguration;
}
