export const calculatePageSize = (maxPageSizeConfig: number, snapPageSizeHeader?: number) => {
    return snapPageSizeHeader ? Math.min(maxPageSizeConfig, snapPageSizeHeader) : maxPageSizeConfig;
};
