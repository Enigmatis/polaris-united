export interface PolarisRequestHeaders {
    dataVersion?: number;
    lastIdInDV?: number;
    includeLinkedOper?: boolean;
    requestId?: string;
    realityId?: number;
    requestingSystemId?: string;
    requestingSystemName?: string;
    upn?: string;
    snapRequest?: boolean;
    snapPageSize?: number;
}
