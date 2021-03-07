import gql from 'graphql-tag';

export const defaultPolarisScalarsTypeDefs = gql`
    scalar Upload
    scalar DateTime
    scalar Long
`;

export const polarisScalarsTypeDefs = gql`
    ${defaultPolarisScalarsTypeDefs}
    scalar GUID
    scalar JSON
    scalar JSONObject
`;
