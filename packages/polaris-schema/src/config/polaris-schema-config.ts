export interface PolarisSchemaConfig {
    addPolarisGraphQLScalars?: boolean;
    addPolarisPermissionsDirective?: boolean;
    polarisTypeDefs?: PolarisTypeDefs;
}

export interface PolarisTypeDefs {
    addPageInfoTypeDef?: boolean;
    addOnlinePagingInputTypeDefs?: boolean;
    addFiltersTypeDefs?: boolean;
}
