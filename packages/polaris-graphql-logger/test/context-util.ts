import { PolarisGraphQLContext, PolarisRequestHeaders } from '@enigmatis/polaris-common';
export const query = 'foo';
export const operationName = 'foo';
export const variables = new Map<string, string>();
variables.set('hello', 'world');
export const getContextWithRequestHeaders = (
    requestHeaders: PolarisRequestHeaders,
    requestingIp: string,
): PolarisGraphQLContext => {
    return {
        requestHeaders,
        request: { query, operationName, variables },
        returnedExtensions: { globalDataVersion: 0 },
        responseHeaders: {},
        clientIp: requestingIp,
        reality: {
            id: 0,
        },
    };
};
