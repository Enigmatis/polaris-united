export interface PermissionResult {
    isPermitted: boolean;
    responseHeaders?: { [name: string]: string | string[] };
    digitalFilters?: { [entity: string]: { [action: string]: any } };
    portalData?: { [data: string]: any };
}
