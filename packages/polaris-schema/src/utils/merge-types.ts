import { ITypeDefinitions } from 'graphql-tools';
import { mergeTypes } from 'merge-graphql-schemas';
import { permissionsTypeDefs } from '../directives/permissions-type-defs';
import {
    defaultPolarisScalarsTypeDefs,
    polarisScalarsTypeDefs,
    repositoryEntityTypeDefs,
    PolarisSchemaConfig,
} from '..';
import { pageInfoTypeDef } from '../common/type-defs/page-info-type-def';
import { onlinePagingInputTypeDefs } from '../common/type-defs/online-paging-type-defs';
import { filtersTypeDefs } from '../common/type-defs/filters-type-defs';

export const getMergedPolarisTypes = (
    polarisSchemaConfig: PolarisSchemaConfig,
    types: ITypeDefinitions,
    shouldEnablePermissions: boolean,
): string => {
    const polarisTypeDefs = getPolarisTypeDefs(polarisSchemaConfig, shouldEnablePermissions);
    return mergeTypes([...polarisTypeDefs, repositoryEntityTypeDefs, types], {
        all: true,
    });
};

function getPolarisTypeDefs(
    polarisSchemaConfig: PolarisSchemaConfig,
    shouldEnablePermissions: boolean,
) {
    const directivesAndScalarsTypeDefs: any[] = [];
    if (shouldEnablePermissions) {
        directivesAndScalarsTypeDefs.push(permissionsTypeDefs);
    }
    if (polarisSchemaConfig.polarisTypeDefs !== false) {
        if (polarisSchemaConfig.polarisTypeDefs?.addOnlinePagingTypeDefs !== false) {
            directivesAndScalarsTypeDefs.push(onlinePagingInputTypeDefs);
            directivesAndScalarsTypeDefs.push(pageInfoTypeDef);
        }
        if (polarisSchemaConfig.polarisTypeDefs?.addFiltersTypeDefs !== false) {
            directivesAndScalarsTypeDefs.push(filtersTypeDefs);
        }
    }
    if (polarisSchemaConfig.addPolarisGraphQLScalars !== false) {
        directivesAndScalarsTypeDefs.push(polarisScalarsTypeDefs);
    } else {
        directivesAndScalarsTypeDefs.push(defaultPolarisScalarsTypeDefs);
    }
    return directivesAndScalarsTypeDefs;
}
