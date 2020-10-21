import {buildFederatedSchema} from '@apollo/federation';
import {GraphQLSchema} from 'graphql';
import gql from 'graphql-tag';
import {IResolvers, ITypeDefinitions, makeExecutableSchema, SchemaDirectiveVisitor,} from 'graphql-tools';
import {PermissionsDirective} from '../directives/permissions-directive';
import {getMergedPolarisResolvers} from './merge-resolvers';
import {getMergedPolarisTypes} from './merge-types';

export function makeExecutablePolarisSchema(
    enableFederation: boolean,
    typeDefs: ITypeDefinitions,
    resolvers?: IResolvers | IResolvers[],
    schemaDirectives?: { [name: string]: typeof SchemaDirectiveVisitor },
): GraphQLSchema {
    const mergedTypes = getMergedPolarisTypes(typeDefs);
    const mergedResolvers = getMergedPolarisResolvers(resolvers);
    schemaDirectives
        ? (schemaDirectives.permissions = PermissionsDirective)
        : (schemaDirectives = { permissions: PermissionsDirective });
    if (enableFederation) {
        const schema = buildFederatedSchema([
            {
                typeDefs: gql`
                    ${mergedTypes}
                `,
                resolvers: mergedResolvers as any,
            },
        ]);

        if (schemaDirectives) {
            SchemaDirectiveVisitor.visitSchemaDirectives(schema, schemaDirectives);
        }

        return schema;
    } else {
        return makeExecutableSchema({
            typeDefs: mergedTypes,
            resolvers: mergedResolvers,
            resolverValidationOptions: {
                requireResolversForResolveType: false,
            },
            schemaDirectives,
        });
    }
}
