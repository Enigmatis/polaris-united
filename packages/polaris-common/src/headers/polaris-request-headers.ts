export interface PolarisRequestHeaders {
    dataVersion?: number;
    lastIdInDV?: string;
    includeLinkedOper?: boolean;
    requestId?: string;
    realityId?: number;
    requestingSystemId?: string;
    requestingSystemName?: string;
    upn?: string;
    snapRequest?: boolean;
    pageSize?: number;
}
