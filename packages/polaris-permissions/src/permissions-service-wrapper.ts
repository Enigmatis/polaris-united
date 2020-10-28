import { PermissionsCache } from '@enigmatis/polaris-common';
import axios from 'axios';
import { httpsOverHttp } from 'tunnel';
import { PermissionResult } from './permission-result';

export class PermissionsServiceWrapper {
    private readonly permissionsServiceUrl?: string;
    private readonly permissionsProxyHost?: string;
    private readonly permissionsProxyPort?: number;

    private readonly permissionsCacheHolder: PermissionsCache;

    constructor(permissionsCacheHolder: PermissionsCache) {
        this.permissionsCacheHolder = permissionsCacheHolder;
        this.permissionsServiceUrl = process.env.PERMISSIONS_SERVICE_URL;
        this.permissionsProxyHost = process.env.PERMISSIONS_PROXY_HOST;
        if (process.env.PERMISSIONS_PROXY_PORT) {
            this.permissionsProxyPort = +process.env.PERMISSIONS_PROXY_PORT;
        }
    }

    public async getPermissionResult(
        upn: string,
        reality: string,
        entityTypes: string[],
        actions: string[],
        permissionHeaders?: { [name: string]: string | string[] },
    ): Promise<PermissionResult> {
        if (!this.permissionsServiceUrl) {
            throw new Error('Permission service url is invalid');
        }

        if (entityTypes.length === 0 || actions.length === 0) {
            return { isPermitted: false };
        }

        for (const entityType of entityTypes) {
            const isPermitted = await this.areActionsPermittedOnEntity(
                upn,
                reality,
                entityType,
                actions,
                permissionHeaders,
            );
            if (!isPermitted) {
                return { isPermitted: false };
            }
        }

        return {
            isPermitted: true,
            digitalFilters: this.permissionsCacheHolder.getDigitalFilters(entityTypes),
            responseHeaders: this.permissionsCacheHolder.getCachedHeaders(entityTypes[0]),
            portalData: this.permissionsCacheHolder.getPortalData(entityTypes),
        };
    }

    private async areActionsPermittedOnEntity(
        upn: string,
        reality: string,
        entityType: string,
        actions: string[],
        permissionHeaders?: { [name: string]: string | string[] },
    ): Promise<boolean> {
        const requestUrl: string = `${this.permissionsServiceUrl}/user/permissions/${upn}/${reality}/${entityType}`;

        let proxy;
        if (this.permissionsProxyHost && this.permissionsProxyPort) {
            proxy = {
                host: this.permissionsProxyHost,
                port: this.permissionsProxyPort,
            };
        }

        if (!this.permissionsCacheHolder.isCached(entityType)) {
            let permissionResponse;
            try {
                permissionResponse = await this.sendRequestToExternalService(
                    requestUrl,
                    proxy,
                    permissionHeaders,
                );
            } catch (e) {
                return true;
            }

            if (permissionResponse.status !== 200) {
                throw new Error(
                    `Status response ${permissionResponse.status} is received when access external permissions service`,
                );
            }

            this.permissionsCacheHolder.addCachedHeaders(entityType, permissionResponse.headers);
            this.getPermittedActionsFromResponse(permissionResponse.data, entityType);
        }
        const permittedActions = this.permissionsCacheHolder.getPermittedActions(entityType);
        if (!permittedActions) {
            return false;
        }
        for (const action of actions) {
            if (!permittedActions.includes(action)) {
                return false;
            }
        }

        return true;
    }

    private async sendRequestToExternalService(
        requestUrl: string,
        proxy?: { host: string; port: number },
        permissionHeaders?: { [p: string]: string | string[] },
    ): Promise<any> {
        let agent;
        if (proxy) {
            agent = httpsOverHttp({
                proxy: { host: proxy.host, port: proxy.port },
                // @ts-ignore
                rejectUnauthorized: false,
            });
        }
        return axios.get(requestUrl, {
            httpsAgent: agent,
            headers: permissionHeaders,
        });
    }

    private getPermittedActionsFromResponse(permissionResponse: any, entityType: string): void {
        const entityTypeActions = permissionResponse?.userPermissions[entityType]?.actions;
        const portalData = permissionResponse?.portalData;

        if (!entityTypeActions) {
            return;
        }

        const permittedActions: string[] = [];
        const actionsDigitalFilters: { [type: string]: any } = {};

        for (const [action, value] of Object.entries(entityTypeActions)) {
            const isPermitted: boolean = (value as any).isPermitted;
            const digitalFilters: any = (value as any).digitalFilters;

            if (isPermitted) {
                permittedActions.push(action);
                actionsDigitalFilters[action] = digitalFilters;
            }
        }

        this.permissionsCacheHolder.addPermissions(entityType, permittedActions);
        this.permissionsCacheHolder.addDigitalFilters(entityType, actionsDigitalFilters);
        if (portalData) {
            this.permissionsCacheHolder.addPortalData(entityType, portalData);
        }
    }
}
