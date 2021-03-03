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
    const jsonScalar = 'scalar JSON';
    const jsonObjectScalar = 'scalar JSONObject';
    const uploadScalar = 'scalar Upload';
    const dateTimeScalar = 'scalar DateTime';
    const pageInfo = 'type PageInfo';
    const onlinePagingInput = 'input OnlinePagingInput';
    const dateRangeFilter = 'input DateRangeFilter';
    const entityFilter = 'input EntityFilter';

    test('addPolarisGraphQLScalars is false, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            addPolarisGraphQLScalars: false,
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);

        expect(mergedPolarisTypes).toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(pageInfo);
        expect(mergedPolarisTypes).toContain(onlinePagingInput);
        expect(mergedPolarisTypes).toContain(dateRangeFilter);
        expect(mergedPolarisTypes).toContain(entityFilter);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(jsonScalar);
        expect(mergedPolarisTypes).not.toContain(jsonObjectScalar);
    });
    test('shouldEnablePolarisPermissions is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {};
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs, false);

        expect(mergedPolarisTypes).not.toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).toContain(longScalar);
        expect(mergedPolarisTypes).toContain(guidScalar);
        expect(mergedPolarisTypes).toContain(jsonScalar);
        expect(mergedPolarisTypes).toContain(jsonObjectScalar);

        expect(mergedPolarisTypes).toContain(pageInfo);
        expect(mergedPolarisTypes).toContain(onlinePagingInput);
        expect(mergedPolarisTypes).toContain(dateRangeFilter);
        expect(mergedPolarisTypes).toContain(entityFilter);
    });
    test('addFiltersTypeDefs is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            addPolarisGraphQLScalars: false,
            polarisTypeDefs: {
                addFiltersTypeDefs: true,
                addOnlinePagingTypeDefs: false,
            },
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);

        expect(mergedPolarisTypes).toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(jsonScalar);
        expect(mergedPolarisTypes).not.toContain(jsonObjectScalar);

        expect(mergedPolarisTypes).not.toContain(pageInfo);
        expect(mergedPolarisTypes).not.toContain(onlinePagingInput);
        expect(mergedPolarisTypes).toContain(dateRangeFilter);
        expect(mergedPolarisTypes).toContain(entityFilter);
    });
    test('addOnlinePagingTypeDefs is true, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {
            addPolarisGraphQLScalars: false,
            polarisTypeDefs: {
                addOnlinePagingTypeDefs: true,
                addFiltersTypeDefs: false,
            },
        };
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs);

        expect(mergedPolarisTypes).toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).not.toContain(longScalar);
        expect(mergedPolarisTypes).not.toContain(guidScalar);
        expect(mergedPolarisTypes).not.toContain(jsonScalar);
        expect(mergedPolarisTypes).not.toContain(jsonObjectScalar);

        expect(mergedPolarisTypes).toContain(pageInfo);
        expect(mergedPolarisTypes).toContain(onlinePagingInput);
        expect(mergedPolarisTypes).not.toContain(dateRangeFilter);
        expect(mergedPolarisTypes).not.toContain(entityFilter);
    });
    test('PolarisSchemaConfig is undefined, returns accordingly', () => {
        const polarisSchemaConfig: PolarisSchemaConfig = {};
        const mergedPolarisTypes = getMergedPolarisTypes(polarisSchemaConfig, typeDefs, true);

        expect(mergedPolarisTypes).toContain(permissionsDirective);

        expect(mergedPolarisTypes).toContain(uploadScalar);
        expect(mergedPolarisTypes).toContain(dateTimeScalar);
        expect(mergedPolarisTypes).toContain(longScalar);
        expect(mergedPolarisTypes).toContain(guidScalar);
        expect(mergedPolarisTypes).toContain(jsonScalar);
        expect(mergedPolarisTypes).toContain(jsonObjectScalar);

        expect(mergedPolarisTypes).toContain(pageInfo);
        expect(mergedPolarisTypes).toContain(onlinePagingInput);
        expect(mergedPolarisTypes).toContain(dateRangeFilter);
        expect(mergedPolarisTypes).toContain(entityFilter);
    });
});
