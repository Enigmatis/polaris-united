import { IResolvers } from 'graphql-tools';
import { mergeResolvers } from 'merge-graphql-schemas';
import { getScalarsResolvers, polarisScalarsResolvers } from '../scalars/polaris-scalars-resolvers';

export const getMergedPolarisResolvers = (
    shouldAddGraphQLScalars: boolean | undefined,
    resolvers?: IResolvers | IResolvers[],
): IResolvers => {
    if (resolvers) {
        return Array.isArray(resolvers)
            ? mergeResolvers([getScalarsResolvers(shouldAddGraphQLScalars) as any, ...resolvers])
            : mergeResolvers([getScalarsResolvers(shouldAddGraphQLScalars) as any, resolvers]);
    } else {
        return polarisScalarsResolvers;
    }
};
