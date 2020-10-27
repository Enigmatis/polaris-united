import gql from 'graphql-tag';

export const repositoryEntityTypeDefs = gql`
    interface RepositoryEntity {
        id: String!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
    }
`;
