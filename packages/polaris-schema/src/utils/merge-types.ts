import { ITypeDefinitions } from 'graphql-tools';
import { mergeTypes } from 'merge-graphql-schemas';
import { repositoryEntityTypeDefs } from '../common/type-defs/repository-entity-type-defs';
import { directivesTypeDefs } from '../directives/directives-type-defs';
import { scalarsTypeDefs } from '../scalars/scalars-type-defs';
import { pageInfoTypeDef } from '../common/type-defs/page-info-type-def';
import { onlinePagingInputTypeDefs } from '../common/type-defs/online-paging-type-defs';

export const getMergedPolarisTypes = (types: ITypeDefinitions): string =>
    mergeTypes(
        [
            repositoryEntityTypeDefs,
            scalarsTypeDefs,
            directivesTypeDefs,
            pageInfoTypeDef,
            onlinePagingInputTypeDefs,
            types,
        ],
        {
            all: true,
        },
    );
