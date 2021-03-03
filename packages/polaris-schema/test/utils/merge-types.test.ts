import gql from 'graphql-tag';
import { getMergedPolarisTypes, PolarisSchemaConfig } from '../../src';

describe('getMergedPolarisTypes tests', () => {
    const typeDefs = gql`
        type Book implements RepositoryEntity {
            title: String
        }

        type Query {
            book: Book
        }
    `;
    const permissionsDirective = 'directive @permissions';
    const longScalar = 'scalar Long';
    const guidScalar = 'scalar GUID';
    const usCurrencyScalar = 'scalar USCurrency';
    const uploadScalar = 'scalar Upload';
    const dateTimeScalar = 'scalar DateTime';

    test('addPolarisDirectives is true and addPolarisGraphQLScalars is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            addPolarisDirectives: true,
            addPolarisGraphQLScalars: true,
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);
        expect(mergedPolarisTypes).toContain(permissionsDirective);
        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).toContain(longScalar);
        expect(mergedPolarisTypes).toContain(guidScalar);
        expect(mergedPolarisTypes).toContain(usCurrencyScalar);
    });
    test('addPolarisDirectives is true and addPolarisGraphQLScalars is false, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            addPolarisDirectives: true,
            addPolarisGraphQLScalars: false,
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);
        expect(mergedPolarisTypes).toContain(permissionsDirective);
        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(usCurrencyScalar);
    });
    test('addPolarisDirectives is false and addPolarisGraphQLScalars is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            addPolarisDirectives: false,
            addPolarisGraphQLScalars: true,
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);
        expect(mergedPolarisTypes).not.toContain(permissionsDirective);
        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).toContain(longScalar);
        expect(mergedPolarisTypes).toContain(guidScalar);
        expect(mergedPolarisTypes).toContain(usCurrencyScalar);
    });
    test('addPolarisDirectives is false and addPolarisGraphQLScalars false, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            addPolarisDirectives: false,
            addPolarisGraphQLScalars: false,
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);
        expect(mergedPolarisTypes).not.toContain(permissionsDirective);
        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(usCurrencyScalar);
    });
});
