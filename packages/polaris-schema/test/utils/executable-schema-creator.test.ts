import {GraphQLInterfaceType, GraphQLScalarType, GraphQLSchema} from 'graphql';
import gql from 'graphql-tag';
import * as graphqlTools from 'graphql-tools';
import {makeExecutablePolarisSchema} from '../../src/main';
import {UpperCaseDirective} from '../upper-case-directive';

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

    describe('federated is on and off', () => {
        test.each`
            isFederateEnabled
            ${false}
            ${true}
        `(
            'making polaris schema, returns GraphQLSchema with federated: $isFederateEnabled',
            ({ isFederateEnabled }: any) => {
                const polarisSchema = makeExecutablePolarisSchema(
                    isFederateEnabled,
                    typeDefs,
                    resolvers,
                );
                expect(polarisSchema).toBeInstanceOf(GraphQLSchema);
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
                    resolvers,
                );
                const bookType = polarisSchema.getType('RepositoryEntity');
                expect(bookType).toBeDefined();
                expect(bookType).toBeInstanceOf(GraphQLInterfaceType);
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
                    resolvers,
                );
                const dateScalarType = polarisSchema.getType('DateTime');
                expect(dateScalarType).toBeDefined();
                expect(dateScalarType).toBeInstanceOf(GraphQLScalarType);
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
                    resolvers,
                );
                const uploadScalarType = polarisSchema.getType('Upload');
                expect(uploadScalarType).toBeDefined();
                expect(uploadScalarType).toBeInstanceOf(GraphQLScalarType);
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

            makeExecutablePolarisSchema(false, typeDefs, resolvers, schemaDirectives);

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

            const schema = makeExecutablePolarisSchema(true, typeDefs, resolvers, schemaDirectives);

            expect(visitSchemaDirectivesSpy).toHaveBeenCalledWith(schema, schemaDirectives);
        });
    });
});
