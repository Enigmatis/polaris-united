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
        id: String
        creationTime: DateRangeFilter
        lastUpdateTime: DateRangeFilter
    }
`;
