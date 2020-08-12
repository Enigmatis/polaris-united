export interface PermissionsCache {
    addPermissions(type: string, permittedActions: string[]): void;
    addDigitalFilters(type: string, digitalFilters: { [action: string]: any }): void;
    addCachedHeaders(type: string, headers: any): void;
    addPortalData(type: string, portalData: any): void;
    isCached(type: string): boolean;
    getPermittedActions(entityType: string): string[];
    getDigitalFilters(entityTypes: string[]): { [entity: string]: { [action: string]: any } };
    getPortalData(entityTypes: string[]): { [data: string]: any };
    getCachedHeaders(entityType: string): any;
}
