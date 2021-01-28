import { Entity } from '@enigmatis/polaris-typeorm';

export {
    createSnapshotRoutes,
    snapshotMetadataRoute,
    snapshotPageRoute,
} from './server/routes/snapshot-routes';
export { ExpressContext } from './server/express-context';
export { PolarisServer, app } from './server/polaris-server';
export * from './config/create-apollo-config-util';
export { PolarisServerOptions } from './config/polaris-server-options';
export { PolarisServerConfig } from './config/polaris-server-config';
export { MiddlewareConfiguration } from './config/middleware-configuration';
export { polarisFormatError } from './errors/error-formatter';
export { SnapshotConfiguration } from './config/snapshot-configuration';
export { PermissionsConfiguration } from './config/permissions-configuration';
export * from 'apollo-server-errors';
export { PubSub, gql } from 'apollo-server-express';
export * from '@enigmatis/polaris-common';
export { Reality, ApplicationProperties } from '@enigmatis/polaris-common';
export * from '@enigmatis/polaris-logs';
export * from '@enigmatis/polaris-graphql-logger';
export * from '@enigmatis/polaris-middlewares';
export * from '@enigmatis/polaris-schema';
export * from '@enigmatis/polaris-typeorm';
export { Entity };
export { getPolarisServerConfigFromOptions } from './server/configurations-manager';
export {
    IResolvers,
    IResolverObject,
    IResolverOptions,
    IResolversParameter,
    IResolverValidationOptions,
    IFieldResolver,
} from 'graphql-tools';
export * from './paging/resolvers/snapshot-paginated-resolver';
export * from './paging/resolvers/online-paginated-resolver';
export { ConnectionlessConfiguration } from '@enigmatis/polaris-middlewares';
export {
    clearSnapshotCleanerInterval,
    setSnapshotCleanerInterval,
} from './paging/snapshot/snapshot-cleaner';
