import { GraphQLInterfaceType, GraphQLScalarType, GraphQLSchema } from 'graphql';
import gql from 'graphql-tag';
import * as graphqlTools from 'graphql-tools';
import { makeExecutablePolarisSchema } from '../../src/main';
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

    test('making polaris schema, returns GraphQLSchema', () => {
        const polarisSchema = makeExecutablePolarisSchema(false, typeDefs, resolvers);
        expect(polarisSchema).toBeInstanceOf(GraphQLSchema);
    });

    test('creating polaris schema, has RepositoryEntity as GraphQLInterfaceType', () => {
        const polarisSchema = makeExecutablePolarisSchema(false, typeDefs, resolvers);
        const bookType = polarisSchema.getType('RepositoryEntity');
        expect(bookType).toBeDefined();
        expect(bookType).toBeInstanceOf(GraphQLInterfaceType);
    });

    test('creating polaris schema, has DateTime as GraphQLScalarType', () => {
        const polarisSchema = makeExecutablePolarisSchema(false, typeDefs, resolvers);
        const dateScalarType = polarisSchema.getType('DateTime');
        expect(dateScalarType).toBeDefined();
        expect(dateScalarType).toBeInstanceOf(GraphQLScalarType);
    });

    test('creating polaris schema, has Upload as GraphQLScalarType', () => {
        const polarisSchema = makeExecutablePolarisSchema(false, typeDefs, resolvers);
        const uploadScalarType = polarisSchema.getType('Upload');
        expect(uploadScalarType).toBeDefined();
        expect(uploadScalarType).toBeInstanceOf(GraphQLScalarType);
    });

    test('creating polaris schema, has UpperDirective as GraphQLDirective', () => {
        const polarisSchema = makeExecutablePolarisSchema(false, typeDefs, resolvers, {
            upper: UpperCaseDirective,
        });
        const uploadScalarType = polarisSchema.getDirective('upper');
        expect(uploadScalarType).toBeDefined();
    });

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
});
