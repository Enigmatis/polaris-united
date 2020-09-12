import { PermissionsCache } from "..";

export interface PermissionsContext {
    permissionsCacheHolder: PermissionsCache;
    digitalFilters: { [entity: string]: { [action: string]: any } };
    portalData: any;
}
