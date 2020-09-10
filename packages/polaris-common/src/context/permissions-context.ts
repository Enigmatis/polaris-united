import { PermissionsCache } from '../permissions/permissions-cache';
import { PolarisGraphQLContext } from './polaris-graphql-context';

export interface PermissionsContext {
    permissionsCacheHolder?: PermissionsCache;
    digitalFilters?: { [entity: string]: { [action: string]: any } };
    portalData?: any;
    systemPermissionsFunction?: (
        context: PolarisGraphQLContext,
        entityTypes: string[],
        actions: string[],
    ) => boolean;
}
