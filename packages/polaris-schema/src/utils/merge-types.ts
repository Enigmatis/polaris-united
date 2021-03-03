import { ITypeDefinitions } from 'graphql-tools';
import { mergeTypes } from 'merge-graphql-schemas';
import { repositoryEntityTypeDefs } from '../common/type-defs/repository-entity-type-defs';
import { permissionsTypeDefs } from '../directives/permissions-type-defs';
import {
    defaultPolarisScalarsTypeDefs,
    polarisScalarsTypeDefs,
} from '../scalars/scalars-type-defs';
import { pageInfoTypeDef } from '../common/type-defs/page-info-type-def';
import { onlinePagingInputTypeDefs } from '../common/type-defs/online-paging-type-defs';
import { filtersTypeDefs } from '../common/type-defs/filters-type-defs';
import { PolarisSchemaConfig } from '../config/polaris-schema-config';

export const getMergedPolarisTypes = (
    polarisSchemaConfig: PolarisSchemaConfig,
    types: ITypeDefinitions,
    shouldEnablePolarisPermissions?: boolean,
): string => {
    const polarisTypeDefs = getPolarisTypeDefs(polarisSchemaConfig, shouldEnablePolarisPermissions);
    return mergeTypes([...polarisTypeDefs, repositoryEntityTypeDefs, types], {
        all: true,
    });
};

function getPolarisTypeDefs(
    polarisSchemaConfig: PolarisSchemaConfig,
    shouldEnablePolarisPermissions?: boolean,
) {
    const directivesAndScalarsTypeDefs: any[] = [];
    if (shouldEnablePolarisPermissions) {
        directivesAndScalarsTypeDefs.push(permissionsTypeDefs);
    }
    if (polarisSchemaConfig.polarisTypeDefs) {
        if (polarisSchemaConfig.polarisTypeDefs.addOnlinePagingTypeDefs) {
            directivesAndScalarsTypeDefs.push(onlinePagingInputTypeDefs);
            directivesAndScalarsTypeDefs.push(pageInfoTypeDef);
        }
        if (polarisSchemaConfig.polarisTypeDefs.addFiltersTypeDefs) {
            directivesAndScalarsTypeDefs.push(filtersTypeDefs);
        }
    }
    if (polarisSchemaConfig.addPolarisGraphQLScalars) {
        directivesAndScalarsTypeDefs.push(polarisScalarsTypeDefs);
    } else {
        directivesAndScalarsTypeDefs.push(defaultPolarisScalarsTypeDefs);
    }
    return directivesAndScalarsTypeDefs;
}
