import gql from 'graphql-tag';

export const permissionsTypeDefs = gql`
    directive @permissions(entityTypes: [String], actions: [String]) on FIELD | FIELD_DEFINITION
`;
