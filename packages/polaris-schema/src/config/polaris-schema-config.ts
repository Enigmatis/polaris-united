export interface PolarisSchemaConfig {
    addPolarisGraphQLScalars?: boolean;
    polarisTypeDefs?: PolarisTypeDefs;
}

export interface PolarisTypeDefs {
    addOnlinePagingTypeDefs?: boolean;
    addFiltersTypeDefs?: boolean;
}
