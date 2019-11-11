import { PolarisRequestHeaders } from '@enigmatis/polaris-common';

export const getContextWithRequestHeaders = (
    requestHeaders: PolarisRequestHeaders,
    requestingIp: string,
) => {
    return {
        requestHeaders,
        request: { query: 'foo' },
        response: jest.fn(),
        returnedExtensions: { globalDataVersion: 0 },
        responseHeaders: {},
        clientIp: requestingIp,
    };
};
