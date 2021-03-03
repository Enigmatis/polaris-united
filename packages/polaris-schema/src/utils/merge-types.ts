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
): string => {
    const directivesAndScalarsTypeDefs = getDirectivesAndScalarsTypeDefs(polarisSchemaConfig);
    return mergeTypes([...directivesAndScalarsTypeDefs, repositoryEntityTypeDefs, types], {
        all: true,
    });
};

function getDirectivesAndScalarsTypeDefs(polarisSchemaConfig: PolarisSchemaConfig) {
    const directivesAndScalarsTypeDefs: any[] = [];
    if (polarisSchemaConfig.addPolarisPermissionsDirective) {
        directivesAndScalarsTypeDefs.push(permissionsTypeDefs);
    }
    if (polarisSchemaConfig.polarisTypeDefs) {
        if (polarisSchemaConfig.polarisTypeDefs.addPageInfoTypeDef) {
            directivesAndScalarsTypeDefs.push(pageInfoTypeDef);
        }
        if (polarisSchemaConfig.polarisTypeDefs.addOnlinePagingInputTypeDefs) {
            directivesAndScalarsTypeDefs.push(onlinePagingInputTypeDefs);
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
