import {
    BigIntResolver,
    DateTimeResolver,
    EmailAddressResolver,
    GUIDResolver,
    HexColorCodeResolver,
    HSLAResolver,
    HSLResolver,
    IPv4Resolver,
    IPv6Resolver,
    ISBNResolver,
    JSONObjectResolver,
    JSONResolver,
    LongResolver,
    MACResolver,
    NegativeFloatResolver,
    NegativeIntResolver,
    NonNegativeFloatResolver,
    NonNegativeIntResolver,
    NonPositiveFloatResolver,
    NonPositiveIntResolver,
    PhoneNumberResolver,
    PortResolver,
    PositiveFloatResolver,
    PositiveIntResolver,
    PostalCodeResolver,
    RGBAResolver,
    RGBResolver,
    UnsignedFloatResolver,
    UnsignedIntResolver,
    URLResolver,
    USCurrencyResolver,
} from 'graphql-scalars';
import { IResolvers } from 'graphql-tools';

export const getScalarsResolvers = (shouldAddGraphQLScalars?: boolean): IResolvers => {
    return shouldAddGraphQLScalars ? polarisScalarsResolvers : defaultPolarisScalarsResolvers;
};

export const defaultPolarisScalarsResolvers: IResolvers = {
    DateTime: DateTimeResolver,
};

export const polarisScalarsResolvers: IResolvers = {
    ...defaultPolarisScalarsResolvers,
    NonPositiveInt: NonPositiveIntResolver,
    PositiveInt: PositiveIntResolver,
    NonNegativeInt: NonNegativeIntResolver,
    NegativeInt: NegativeIntResolver,
    NonPositiveFloat: NonPositiveFloatResolver,
    PositiveFloat: PositiveFloatResolver,
    NonNegativeFloat: NonNegativeFloatResolver,
    NegativeFloat: NegativeFloatResolver,
    UnsignedFloat: UnsignedFloatResolver,
    UnsignedInt: UnsignedIntResolver,
    BigInt: BigIntResolver,
    Long: LongResolver,

    EmailAddress: EmailAddressResolver,
    URL: URLResolver,
    PhoneNumber: PhoneNumberResolver,
    PostalCode: PostalCodeResolver,

    GUID: GUIDResolver,

    HexColorCode: HexColorCodeResolver,
    HSL: HSLResolver,
    HSLA: HSLAResolver,
    RGB: RGBResolver,
    RGBA: RGBAResolver,

    IPv4: IPv4Resolver,
    IPv6: IPv6Resolver,
    MAC: MACResolver,
    Port: PortResolver,

    ISBN: ISBNResolver,

    USCurrency: USCurrencyResolver,
    JSON: JSONResolver,
    JSONObject: JSONObjectResolver,
};
