export interface PolarisSchemaConfig {
    addPolarisGraphQLScalars?: boolean;
    polarisTypeDefs?: PolarisTypeDefsConfiguration;
}

export interface PolarisTypeDefsConfiguration {
    addOnlinePagingTypeDefs?: boolean;
    addFiltersTypeDefs?: boolean;
}
