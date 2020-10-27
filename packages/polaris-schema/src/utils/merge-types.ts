import { ITypeDefinitions } from 'graphql-tools';
import { mergeTypes } from 'merge-graphql-schemas';
import { repositoryEntityTypeDefs } from '../common/repository-entity-type-defs';
import { directivesTypeDefs } from '../directives/directives-type-defs';
import { scalarsTypeDefs } from '../scalars/scalars-type-defs';
import { pageInfoTypeDef } from '../common/page-info-type-def';

export const getMergedPolarisTypes = (types: ITypeDefinitions): string =>
    mergeTypes(
        [repositoryEntityTypeDefs, scalarsTypeDefs, directivesTypeDefs, pageInfoTypeDef, types],
        {
            all: true,
        },
    );
