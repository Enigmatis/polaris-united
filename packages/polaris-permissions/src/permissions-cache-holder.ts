import { PermissionsCache } from '@enigmatis/polaris-common';

export class PermissionsCacheHolder implements PermissionsCache {
    private readonly cachedPermittedTypesActions: { [type: string]: string[] };
    private readonly cachedTypesActionDigitalFilters: {
        [entity: string]: { [action: string]: any };
    };
    private readonly cachedTypesHeaders: { [type: string]: any };
    private readonly portalData: { [data: string]: any };

    constructor() {
        this.cachedPermittedTypesActions = {};
        this.cachedTypesActionDigitalFilters = {};
        this.cachedTypesHeaders = {};
        this.portalData = {};
    }

    public addPermissions(type: string, permittedActions: string[]): void {
        if (this.cachedPermittedTypesActions) {
            this.cachedPermittedTypesActions[type] = permittedActions;
        }
    }

    public addDigitalFilters(type: string, digitalFilters: { [action: string]: any }): void {
        if (this.cachedTypesActionDigitalFilters) {
            this.cachedTypesActionDigitalFilters[type] = digitalFilters;
        }
    }

    public addCachedHeaders(type: string, headers: any): void {
        if (this.cachedTypesHeaders) {
            this.cachedTypesHeaders[type] = headers;
        }
    }

    public addPortalData(type: string, portalData: any): void {
        if (this.portalData) {
            this.portalData[type] = portalData;
        }
    }

    public isCached(type: string): boolean {
        return type in this.cachedPermittedTypesActions;
    }

    public getPermittedActions(entityType: string): string[] {
        return this.cachedPermittedTypesActions[entityType];
    }

    public getDigitalFilters(
        entityTypes: string[],
    ): { [entity: string]: { [action: string]: any } } {
        const digitalFilters: { [entity: string]: { [action: string]: any } } = {};

        for (const entityType of entityTypes) {
            digitalFilters[entityType] = this.cachedTypesActionDigitalFilters[entityType];
        }

        return digitalFilters;
    }

    public getCachedHeaders(entityType: string): any {
        return this.cachedTypesHeaders[entityType];
    }

    public getPortalData(entityTypes: string[]): { [data: string]: any } {
        const portalData: { [data: string]: any } = {};

        for (const entityType of entityTypes) {
            portalData[entityType] = this.portalData[entityType];
        }

        return portalData;
    }
}
