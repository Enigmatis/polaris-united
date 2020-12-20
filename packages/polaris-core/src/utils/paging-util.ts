export const calculatePageSize = (maxPageSizeConfig: number, pageSizeHeader?: number) => {
    return pageSizeHeader ? Math.min(maxPageSizeConfig, pageSizeHeader) : maxPageSizeConfig;
};
