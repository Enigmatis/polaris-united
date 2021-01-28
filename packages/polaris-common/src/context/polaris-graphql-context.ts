import { GraphQLError } from 'graphql';
import { EntityFilter, PermissionsContext, Reality } from '..';
import { DataVersionContext } from './data-version-context';
import { PolarisBaseContext } from './polaris-base-context';
import { PolarisExtensions } from './polaris-extensions';
import { PolarisGraphQLRequest } from './polaris-request';
import { SnapshotContext } from './snapshot-context';
import { OnlinePaginatedContext } from './online-paginated-context';
import { DataLoaderHolder } from '../data-loaders/data-loader-holder';
import { DataLoaderInitializer } from '../data-loaders/data-loader-initializer';

export interface PolarisGraphQLContext extends PolarisBaseContext {
    request: PolarisGraphQLRequest;
    returnedExtensions: PolarisExtensions;
    reality: Reality;
    errors?: GraphQLError[];
    onlinePaginatedContext?: OnlinePaginatedContext;
    snapshotContext?: SnapshotContext;
    permissionsContext?: PermissionsContext;
    dataVersionContext?: DataVersionContext;
    connectionlessQueryExecutorClient?: any;
    logDocumentId?: string;
    requestStartedTime?: number;
    entityDateRangeFilter?: EntityFilter;
    dataLoaders?: DataLoaderHolder[];
    dataLoaderService?: DataLoaderInitializer;
}
