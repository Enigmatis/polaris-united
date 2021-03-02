import gql from 'graphql-tag';

export const defaultPolarisScalarsTypeDefs = gql`
    scalar Upload
    scalar DateTime
`;

export const polarisScalarsTypeDefs =
    defaultPolarisScalarsTypeDefs &&
    gql`
        scalar EmailAddress
        scalar NegativeFloat
        scalar NegativeInt
        scalar NonNegativeFloat
        scalar NonNegativeInt
        scalar NonPositiveFloat
        scalar NonPositiveInt
        scalar PhoneNumber
        scalar PositiveFloat
        scalar PositiveInt
        scalar PostalCode
        scalar UnsignedFloat
        scalar UnsignedInt
        scalar URL
        scalar BigInt
        scalar Long
        scalar GUID
        scalar HexColorCode
        scalar HSL
        scalar HSLA
        scalar IPv4
        scalar IPv6
        scalar ISBN
        scalar MAC
        scalar Port
        scalar RGB
        scalar RGBA
        scalar USCurrency
        scalar JSON
        scalar JSONObject
    `;
