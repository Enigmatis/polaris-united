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
    const pageInfo = 'type PageInfo';
    const onlinePagingInput = 'input OnlinePagingInput';
    const dateRangeFilter = 'input DateRangeFilter';
    const entityFilter = 'input EntityFilter';

    test('addPolarisGraphQLScalars is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            addPolarisGraphQLScalars: true,
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);

        expect(mergedPolarisTypes).not.toContain(permissionsDirective);

        expect(mergedPolarisTypes).not.toContain(pageInfo);
        expect(mergedPolarisTypes).not.toContain(onlinePagingInput);
        expect(mergedPolarisTypes).not.toContain(dateRangeFilter);
        expect(mergedPolarisTypes).not.toContain(entityFilter);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).toContain(longScalar);
        expect(mergedPolarisTypes).toContain(guidScalar);
        expect(mergedPolarisTypes).toContain(usCurrencyScalar);
    });
    test('addPolarisPermissionsDirective is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            addPolarisPermissionsDirective: true,
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);

        expect(mergedPolarisTypes).toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(usCurrencyScalar);

        expect(mergedPolarisTypes).not.toContain(pageInfo);
        expect(mergedPolarisTypes).not.toContain(onlinePagingInput);
        expect(mergedPolarisTypes).not.toContain(dateRangeFilter);
        expect(mergedPolarisTypes).not.toContain(entityFilter);
    });
    test('addFiltersTypeDefs is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            polarisTypeDefs: {
                addFiltersTypeDefs: true,
            },
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);

        expect(mergedPolarisTypes).not.toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(usCurrencyScalar);

        expect(mergedPolarisTypes).not.toContain(pageInfo);
        expect(mergedPolarisTypes).not.toContain(onlinePagingInput);
        expect(mergedPolarisTypes).toContain(dateRangeFilter);
        expect(mergedPolarisTypes).toContain(entityFilter);
    });
    test('addOnlinePagingInputTypeDefs is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            polarisTypeDefs: {
                addOnlinePagingInputTypeDefs: true,
            },
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);

        expect(mergedPolarisTypes).not.toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(usCurrencyScalar);

        expect(mergedPolarisTypes).not.toContain(pageInfo);
        expect(mergedPolarisTypes).toContain(onlinePagingInput);
        expect(mergedPolarisTypes).not.toContain(dateRangeFilter);
        expect(mergedPolarisTypes).not.toContain(entityFilter);
    });
    test('addPageInfoTypeDef is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            polarisTypeDefs: {
                addPageInfoTypeDef: true,
            },
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);

        expect(mergedPolarisTypes).not.toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(usCurrencyScalar);

        expect(mergedPolarisTypes).toContain(pageInfo);
        expect(mergedPolarisTypes).not.toContain(onlinePagingInput);
        expect(mergedPolarisTypes).not.toContain(dateRangeFilter);
        expect(mergedPolarisTypes).not.toContain(entityFilter);
    });
    test('PolarisSchemaConfig is undefined, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {};
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);

        expect(mergedPolarisTypes).not.toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(usCurrencyScalar);

        expect(mergedPolarisTypes).not.toContain(pageInfo);
        expect(mergedPolarisTypes).not.toContain(onlinePagingInput);
        expect(mergedPolarisTypes).not.toContain(dateRangeFilter);
        expect(mergedPolarisTypes).not.toContain(entityFilter);
    });
});
