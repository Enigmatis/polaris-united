import axios from 'axios';
import { port, version } from '../shared-resources/polaris-properties.json';

export const url = `http://localhost:${port}/${version}/snapshot`;
export const metadataUrl = `http://localhost:${port}/${version}/snapshot/metadata`;

export const snapshotRequest = async (snapshotId: string, headers?: any) => {
    return axios(url + '?id=' + snapshotId, { method: 'get', headers });
};

export const metadataRequest = async (snapshotMetadataId: string, headers?: any) => {
    return axios(metadataUrl + '?id=' + snapshotMetadataId, { method: 'get' });
};

export const waitUntilSnapshotRequestIsDone = async (metadataId: string, delayInMs: number) => {
    let response;
    do {
        await sleep(delayInMs);
        response = await metadataRequest(metadataId);
    } while (response?.data?.status === 'IN_PROGRESS');

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
