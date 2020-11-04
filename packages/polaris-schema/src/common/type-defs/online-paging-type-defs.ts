import gql from 'graphql-tag';

export const onlinePagingInputTypeDefs = gql`
    input OnlinePagingInput {
        first: Int
        last: Int
        before: String
        after: String
    }
`;
