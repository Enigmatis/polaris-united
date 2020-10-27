import gql from 'graphql-tag';

export const pageInfoTypeDef = gql`
    type PageInfo {
        startCursor: String
        endCursor: String
        hasNextPage: Boolean
        hasPreviousPage: Boolean
    }
`;
