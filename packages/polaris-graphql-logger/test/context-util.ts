import { PolarisRequestHeaders } from '@enigmatis/polaris-common';
export const requestQuery = 'foo';
export const getContextWithRequestHeaders = (
    requestHeaders: PolarisRequestHeaders,
    requestingIp: string,
) => {
    return {
        requestHeaders,
        request: { query: requestQuery },
        response: jest.fn(),
        returnedExtensions: { globalDataVersion: 0 },
        responseHeaders: {},
        clientIp: requestingIp,
    };
};
