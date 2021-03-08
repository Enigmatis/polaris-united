import {
    DateTimeResolver,
    GUIDResolver,
    JSONObjectResolver,
    JSONResolver,
    LongResolver,
} from 'graphql-scalars';
import { IResolvers } from 'graphql-tools';

export const getScalarsResolvers = (shouldAddGraphQLScalars?: boolean): IResolvers => {
    return shouldAddGraphQLScalars !== false
        ? polarisScalarsResolvers
        : defaultPolarisScalarsResolvers;
};

export const defaultPolarisScalarsResolvers: IResolvers = {
    DateTime: DateTimeResolver,
};

export const polarisScalarsResolvers: IResolvers = {
    ...defaultPolarisScalarsResolvers,
    Long: LongResolver,
    GUID: GUIDResolver,
    JSON: JSONResolver,
    JSONObject: JSONObjectResolver,
};
