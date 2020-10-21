import { PolarisRequestHeaders, PolarisResponseHeaders } from '..';

export interface PolarisBaseContext {
    requestHeaders: PolarisRequestHeaders;
    responseHeaders: PolarisResponseHeaders;
    clientIp: string;
}
