import { PolarisGraphQLContext } from '@enigmatis/polaris-common';

export interface PermissionsConfiguration {
    systemPermissionsFunction?: (
        context: PolarisGraphQLContext,
        entityTypes: string[],
        actions: string[],
    ) => boolean;
    permissionsHeaders?: string[];
}
