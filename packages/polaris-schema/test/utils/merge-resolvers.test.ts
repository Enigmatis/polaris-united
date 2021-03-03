import {
    DateTimeResolver,
    GUIDResolver,
    JSONObjectResolver,
    JSONResolver,
    LongResolver,
} from 'graphql-scalars';
import { getMergedPolarisResolvers } from '../../src';

describe('getMergedPolarisResolvers tests', () => {
    const resolvers = {
        Query: {
            book() {
                return {
                    title: 'foo',
                };
            },
        },
        Mutation: {
            createBook() {
                return {
                    title: 'foo',
                };
            },
        },
    };

    test('addPolarisGraphQLScalars is true, returns accordingly', () => {
        const mergedPolarisResolvers = getMergedPolarisResolvers(true, resolvers);
        expect(mergedPolarisResolvers).toEqual(
            expect.objectContaining({ DateTime: DateTimeResolver }),
        );
        expect(mergedPolarisResolvers).toEqual(expect.objectContaining({ JSON: JSONResolver }));
        expect(mergedPolarisResolvers).toEqual(
            expect.objectContaining({ JSONObject: JSONObjectResolver }),
        );
        expect(mergedPolarisResolvers).toEqual(expect.objectContaining({ Long: LongResolver }));
        expect(mergedPolarisResolvers).toEqual(expect.objectContaining({ GUID: GUIDResolver }));
        expect(mergedPolarisResolvers).toEqual(expect.objectContaining({ JSON: JSONResolver }));
    });

    test('addPolarisGraphQLScalars is false, returns accordingly', () => {
        const mergedPolarisResolvers = getMergedPolarisResolvers(false, resolvers);
        expect(mergedPolarisResolvers).toEqual(
            expect.objectContaining({ DateTime: DateTimeResolver }),
        );
        expect(mergedPolarisResolvers).toEqual(expect.not.objectContaining({ Long: LongResolver }));
        expect(mergedPolarisResolvers).toEqual(expect.not.objectContaining({ GUID: GUIDResolver }));
        expect(mergedPolarisResolvers).toEqual(expect.not.objectContaining({ JSON: JSONResolver }));
        expect(mergedPolarisResolvers).toEqual(
            expect.not.objectContaining({ JSONObject: JSONObjectResolver }),
        );
        expect(mergedPolarisResolvers).toEqual(expect.not.objectContaining({ JSON: JSONResolver }));
    });
});
