import gql from 'graphql-tag';
import * as graphqlTools from 'graphql-tools';
import { makeExecutablePolarisSchema, PolarisSchemaConfig } from '../../src';
import { UpperCaseDirective } from '../upper-case-directive';

describe('makeExecutablePolarisSchema tests', () => {
    const typeDefs = gql`
        directive @upper on FIELD_DEFINITION

        type Book implements RepositoryEntity {
            title: String @upper
        }

        type Query {
            book: Book
        }
    `;

    const resolvers = {
        Query: {
            book() {
                return {
                    title: 'foo',
                };
            },
        },
    };

    const polarisSchemaConfig: PolarisSchemaConfig = {
        addPolarisGraphQLScalars: true,
        polarisTypeDefs: {
            addFiltersTypeDefs: true,
            addOnlinePagingTypeDefs: true,
        },
    };

    describe('federated is on and off', () => {
        test.each`
            isFederateEnabled | enablePermissions
            ${true}           | ${true}
            ${true}           | ${false}
            ${false}          | ${true}
            ${false}          | ${false}
        `(
            'making polaris schema, returns GraphQLSchema with federated: $isFederateEnabled',
            ({ isFederateEnabled, enablePermissions }) => {
                expect(
                    makeExecutablePolarisSchema(
                        isFederateEnabled,
                        typeDefs,
                        polarisSchemaConfig,
                        enablePermissions,
                        resolvers,
                    ).constructor.name,
                ).toBe('GraphQLSchema');
            },
        );

        test.each`
            isFederateEnabled | enablePermissions
            ${true}           | ${true}
            ${true}           | ${false}
            ${false}          | ${true}
            ${false}          | ${false}
        `(
            'creating polaris schema, has RepositoryEntity as GraphQLInterfaceType with federated: $isFederateEnabled',
            ({ isFederateEnabled, enablePermissions }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
                    enablePermissions,
                    resolvers,
                );
                const bookType = polarisSchema.getType('RepositoryEntity');
                expect(bookType).toBeDefined();
                expect(bookType!.constructor.name).toBe('GraphQLInterfaceType');
            },
        );

        test.each`
            isFederateEnabled | enablePermissions
            ${true}           | ${true}
            ${true}           | ${false}
            ${false}          | ${true}
            ${false}          | ${false}
        `(
            'creating polaris schema, has DateTime as GraphQLScalarType with federated: $isFederateEnabled',
            ({ isFederateEnabled, enablePermissions }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
                    enablePermissions,
                    resolvers,
                );
                const dateScalarType = polarisSchema.getType('DateTime');
                expect(dateScalarType).toBeDefined();
                expect(dateScalarType!.constructor.name).toBe('GraphQLScalarType');
            },
        );

        test.each`
            isFederateEnabled | enablePermissions
            ${true}           | ${true}
            ${true}           | ${false}
            ${false}          | ${true}
            ${false}          | ${false}
        `(
            'creating polaris schema, has Upload as GraphQLScalarType with federated: $isFederateEnabled',
            ({ isFederateEnabled, enablePermissions }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
                    enablePermissions,
                    resolvers,
                );
                const uploadScalarType = polarisSchema.getType('Upload');
                expect(uploadScalarType).toBeDefined();
                expect(uploadScalarType!.constructor.name).toBe('GraphQLScalarType');
            },
        );

        test.each`
            isFederateEnabled | enablePermissions
            ${true}           | ${true}
            ${true}           | ${false}
            ${false}          | ${true}
            ${false}          | ${false}
        `(
            'creating polaris schema, has UpperDirective as GraphQLDirective with federated: $isFederateEnabled',
            ({ isFederateEnabled, enablePermissions }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
                    enablePermissions,
                    resolvers,
                    {
                        upper: UpperCaseDirective,
                    },
                );
                const uploadScalarType = polarisSchema.getDirective('upper');
                expect(uploadScalarType).toBeDefined();
            },
        );

        test.each`
            isFederateEnabled | enablePermissions
            ${true}           | ${true}
            ${true}           | ${false}
            ${false}          | ${true}
            ${false}          | ${false}
        `(
            'creating federated schema will add a _service field with federated: $isFederateEnabled',
            ({ isFederateEnabled, enablePermissions }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
                    enablePermissions,
                    resolvers,
                );

                if (isFederateEnabled) {
                    expect(polarisSchema.getQueryType()?.getFields()._service).toBeDefined();
                } else {
                    expect(polarisSchema.getQueryType()?.getFields()._service).toBeUndefined();
                }
            },
        );
    });

    describe('directives are added to the schema', () => {
        test.each`
            enablePermissions
            ${false}
            ${true}
        `(
            'creating polaris schema, makeExecutableSchema has been called with schema directives',
            ({ enablePermissions }: any) => {
                const makeExecutableSchemaSpy = jest.spyOn(graphqlTools, 'makeExecutableSchema');

                const schemaDirectives = {
                    upper: UpperCaseDirective,
                };

                makeExecutablePolarisSchema(
                    false,
                    typeDefs,
                    polarisSchemaConfig,
                    enablePermissions,
                    resolvers,
                    schemaDirectives,
                );

                expect(makeExecutableSchemaSpy).toHaveBeenCalledWith(
                    expect.objectContaining({ schemaDirectives }),
                );
            },
        );

        test.each`
            enablePermissions
            ${false}
            ${true}
        `(
            'creating polaris schema, SchemaDirectiveVisitor has been called with schema directives',
            ({ enablePermissions }: any) => {
                const visitSchemaDirectivesSpy = jest.spyOn(
                    graphqlTools.SchemaDirectiveVisitor,
                    'visitSchemaDirectives',
                );

                const schemaDirectives = {
                    upper: UpperCaseDirective,
                };

                const schema = makeExecutablePolarisSchema(
                    true,
                    typeDefs,
                    polarisSchemaConfig,
                    enablePermissions,
                    resolvers,
                    schemaDirectives,
                );

                expect(visitSchemaDirectivesSpy).toHaveBeenCalledWith(schema, schemaDirectives);
            },
        );
    });
});
