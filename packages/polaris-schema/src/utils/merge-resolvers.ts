import {IResolvers} from 'graphql-tools';
import {mergeResolvers} from 'merge-graphql-schemas';
import {scalarsResolvers} from '../scalars/scalars-resolvers';

export const getMergedPolarisResolvers = (resolvers?: IResolvers | IResolvers[]): IResolvers => {
    if (resolvers) {
        return Array.isArray(resolvers)
            ? mergeResolvers([scalarsResolvers as any, ...resolvers])
            : mergeResolvers([scalarsResolvers as any, resolvers]);
    } else {
        return scalarsResolvers;
    }
};
