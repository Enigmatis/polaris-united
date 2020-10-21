import {OICD_CLAIM_UPN, REALITY_ID, REQUEST_ID} from '@enigmatis/polaris-core';
import axios from 'axios';
import * as polarisProperties from '../shared-resources/polaris-properties.json';
import {createServers} from '../test-utils/tests-servers-util';

describe('response headers tests', () => {
    const url = `http://localhost:${polarisProperties.port}/${polarisProperties.version}/graphql`;
    const query = '{ allBooks { title } }';
    test.each(createServers())('response headers are set', async (server) => {
        await server.start();
        const result = await axios.post(url, { query });
        expect(result.headers[REQUEST_ID]).toBeDefined();
        expect(result.headers[REALITY_ID]).toBeDefined();
        await server.stop();
    });
    test.each(createServers())('reality id is passed from the request', async (server) => {
        await server.start();
        const realityId = 0;
        const headers = { 'reality-id': realityId };
        const result = await axios.post(url, { query }, { headers });
        expect(result.headers[REALITY_ID]).toBe(String(realityId));
        await server.stop();
    });
    test.each(createServers())('upn is passed from the request', async (server) => {
        await server.start();

        const upn = 'just some upn';
        const headers = { 'oicd-claim-upn': upn };
        const result = await axios.post(url, { query }, { headers });
        expect(result.headers[OICD_CLAIM_UPN]).toBe(upn);
        await server.stop();
    });
    test.each(createServers())('request id is passed from the request', async (server) => {
        await server.start();
        const requestId = 'troubles';
        const headers = { 'request-id': requestId };
        const result = await axios.post(url, { query }, { headers });
        expect(result.headers[REQUEST_ID]).toBe(requestId);
        await server.stop();
    });
});
