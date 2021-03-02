import { ITypeDefinitions } from 'graphql-tools';
import { mergeTypes } from 'merge-graphql-schemas';
import { repositoryEntityTypeDefs } from '../common/type-defs/repository-entity-type-defs';
import { directivesTypeDefs } from '../directives/directives-type-defs';
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
    return mergeTypes(
        [
            ...directivesAndScalarsTypeDefs,
            repositoryEntityTypeDefs,
            pageInfoTypeDef,
            onlinePagingInputTypeDefs,
            filtersTypeDefs,
            types,
        ],
        {
            all: true,
        },
    );
};

function getDirectivesAndScalarsTypeDefs(polarisSchemaConfig: PolarisSchemaConfig) {
    const directivesAndScalarsTypeDefs: any[] = [];
    if (polarisSchemaConfig.shouldAddPolarisDirectives) {
        directivesAndScalarsTypeDefs.push(directivesTypeDefs);
    }
    if (polarisSchemaConfig.shouldAddPolarisGraphQLScalars) {
        directivesAndScalarsTypeDefs.push(polarisScalarsTypeDefs);
    } else {
        directivesAndScalarsTypeDefs.push(defaultPolarisScalarsTypeDefs);
    }
    return directivesAndScalarsTypeDefs;
}
