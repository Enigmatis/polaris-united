import { PolarisGraphQLContext } from '@enigmatis/polaris-common';

export interface PermissionsConfiguration {
    customPermissionsFunction?: (
        context: PolarisGraphQLContext,
        entityTypes: string[],
        actions: string[],
    ) => boolean;
}
