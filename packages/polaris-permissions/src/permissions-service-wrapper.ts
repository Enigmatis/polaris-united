import { PermissionsCache } from '@enigmatis/polaris-common';
import { PolarisLogger } from '@enigmatis/polaris-logs';
import axios from 'axios';
import { PermissionResult } from './permission-result';

export class PermissionsServiceWrapper {
    constructor(
        private readonly serviceUrl: string,
        private readonly logger: PolarisLogger,
        private readonly permissionsCacheHolder: PermissionsCache,
    ) {}

    public async getPermissionResult(
        upn: string,
        reality: string,
        entityTypes: string[],
        actions: string[],
        permissionHeaders?: { [name: string]: string | string[] },
    ): Promise<PermissionResult> {
        if (!this.serviceUrl) {
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
        const requestUrlForType: string = `${this.serviceUrl}/user/permissions/${upn}/${reality}/${entityType}`;

        try {
            if (!this.permissionsCacheHolder.isCached(entityType)) {
                const permissionResponse = await this.sendRequestToExternalService(
                    requestUrlForType,
                    permissionHeaders,
                );
                if (permissionResponse.status !== 200) {
                    throw new Error(
                        `Status response ${permissionResponse.status} is received when access external permissions service`,
                    );
                }

                this.permissionsCacheHolder.addCachedHeaders(
                    entityType,
                    permissionResponse.headers,
                );
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
        } catch (e) {
            throw e;
        }

        return true;
    }

    private async sendRequestToExternalService(
        requestUrlForType: string,
        permissionHeaders?: { [p: string]: string | string[] },
    ): Promise<any> {
        const timeStart = new Date().getTime();
        this.logger.info('Sending request to external permissions service', {
            customProperties: {
                requestUrl: requestUrlForType,
                requestDestination: this.serviceUrl,
                requestHeaders: permissionHeaders,
            },
        });
        const result = await axios.get(requestUrlForType, {
            method: 'get',
            headers: permissionHeaders,
        });
        this.logger.info('Finished request to external permissions server', {
            response: result,
            elapsedTime: new Date().getTime() - timeStart,
            customProperties: {
                responseHttpCode: result.status,
                responseHeaders: result.headers,
            },
        });
        return result;
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
