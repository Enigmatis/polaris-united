import gql from 'graphql-tag';

export const entityFilterInputTypeName = 'EntityFilter';
export const filtersTypeDefs = gql`
    input DateRangeFilter {
        gt: String
        gte: String
        lt: String
        lte: String
    }

    input ${entityFilterInputTypeName} {
        creationTime: DateRangeFilter
        lastUpdateTime: DateRangeFilter
    }
`;
