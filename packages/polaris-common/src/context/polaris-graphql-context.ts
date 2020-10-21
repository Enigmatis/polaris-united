import { GraphQLError } from 'graphql';
import { PermissionsContext, Reality } from '..';
import { PolarisBaseContext } from './polaris-base-context';
import { PolarisExtensions } from './polaris-extensions';
import { PolarisGraphQLRequest } from './polaris-request';
import { SnapshotContext } from './snapshot-context';

export interface PolarisGraphQLContext extends PolarisBaseContext {
    request: PolarisGraphQLRequest;
    returnedExtensions: PolarisExtensions;
    reality: Reality;
    errors?: GraphQLError[];
    snapshotContext?: SnapshotContext;
    permissionsContext?: PermissionsContext;
    connectionLessQueryExecutorClient?: any;
}
