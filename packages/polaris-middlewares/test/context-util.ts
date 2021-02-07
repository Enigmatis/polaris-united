import { PolarisGraphQLContext, PolarisRequestHeaders } from '@enigmatis/polaris-common';

export const getContextWithRequestHeaders = (
    requestHeaders: PolarisRequestHeaders,
): PolarisGraphQLContext => {
    return {
        requestHeaders,
        request: { query: 'foo' },
        returnedExtensions: { dataVersion: 5 },
        responseHeaders: {},
        clientIp: 'bar',
        reality: { id: 0 },
        dataloaderContext: {
            dataLoaders: [],
            dataLoaderService: {} as any,
        }
    };
};
