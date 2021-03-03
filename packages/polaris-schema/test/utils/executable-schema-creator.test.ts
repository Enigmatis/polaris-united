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
        addPolarisPermissionsDirective: true,
        addPolarisGraphQLScalars: true,
    };

    describe('federated is on and off', () => {
        test.each`
            isFederateEnabled
            ${false}
            ${true}
        `(
            'making polaris schema, returns GraphQLSchema with federated: $isFederateEnabled',
            ({ isFederateEnabled }: any) => {
                expect(
                    makeExecutablePolarisSchema(
                        isFederateEnabled,
                        typeDefs,
                        polarisSchemaConfig,
                        resolvers,
                    ).constructor.name,
                ).toBe('GraphQLSchema');
            },
        );

        test.each`
            isFederateEnabled
            ${false}
            ${true}
        `(
            'creating polaris schema, has RepositoryEntity as GraphQLInterfaceType with federated: $isFederateEnabled',
            ({ isFederateEnabled }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
                    resolvers,
                );
                const bookType = polarisSchema.getType('RepositoryEntity');
                expect(bookType).toBeDefined();
                expect(bookType!.constructor.name).toBe('GraphQLInterfaceType');
            },
        );

        test.each`
            isFederateEnabled
            ${false}
            ${true}
        `(
            'creating polaris schema, has DateTime as GraphQLScalarType with federated: $isFederateEnabled',
            ({ isFederateEnabled }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
                    resolvers,
                );
                const dateScalarType = polarisSchema.getType('DateTime');
                expect(dateScalarType).toBeDefined();
                expect(dateScalarType!.constructor.name).toBe('GraphQLScalarType');
            },
        );

        test.each`
            isFederateEnabled
            ${false}
            ${true}
        `(
            'creating polaris schema, has Upload as GraphQLScalarType with federated: $isFederateEnabled',
            ({ isFederateEnabled }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
                    resolvers,
                );
                const uploadScalarType = polarisSchema.getType('Upload');
                expect(uploadScalarType).toBeDefined();
                expect(uploadScalarType!.constructor.name).toBe('GraphQLScalarType');
            },
        );

        test.each`
            isFederateEnabled
            ${false}
            ${true}
        `(
            'creating polaris schema, has UpperDirective as GraphQLDirective with federated: $isFederateEnabled',
            ({ isFederateEnabled }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
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
            isFederateEnabled
            ${false}
            ${true}
        `(
            'creating federated schema will add a _service field with federated: $isFederateEnabled',
            ({ isFederateEnabled }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    polarisSchemaConfig,
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
        test('creating polaris schema, makeExecutableSchema has been called with schema directives', () => {
            const makeExecutableSchemaSpy = jest.spyOn(graphqlTools, 'makeExecutableSchema');

            const schemaDirectives = {
                upper: UpperCaseDirective,
            };

            makeExecutablePolarisSchema(
                false,
                typeDefs,
                polarisSchemaConfig,
                resolvers,
                schemaDirectives,
            );

            expect(makeExecutableSchemaSpy).toHaveBeenCalledWith(
                expect.objectContaining({ schemaDirectives }),
            );
        });

        test('creating polaris schema, SchemaDirectiveVisitor has been called with schema directives', () => {
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
                resolvers,
                schemaDirectives,
            );

            expect(visitSchemaDirectivesSpy).toHaveBeenCalledWith(schema, schemaDirectives);
        });
    });
});
