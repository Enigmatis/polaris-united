import gql from 'graphql-tag';

export const defaultPolarisScalarsTypeDefs = gql`
    scalar Upload
    scalar DateTime
    scalar BigInt
`;

export const polarisScalarsTypeDefs = gql`
    ${defaultPolarisScalarsTypeDefs}
    scalar Long
    scalar GUID
    scalar JSON
    scalar JSONObject
`;
