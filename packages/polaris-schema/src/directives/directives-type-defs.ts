import gql from 'graphql-tag';

export const directivesTypeDefs = gql`
    directive @permissions(entityTypes: [String], actions: [String]) on FIELD | FIELD_DEFINITION
`;
