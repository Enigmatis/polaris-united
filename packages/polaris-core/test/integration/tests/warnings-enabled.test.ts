import { PolarisServer, PolarisServerOptions } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest } from '../server/utils/graphql-client';
import * as booksWithWarnings from './jsonRequestsAndHeaders/allBooksWithWarnings.json';

let polarisServer: PolarisServer;

describe('warnings enabled tests', () => {
    describe('shouldAddWarningsToExtensions is true', () => {
        beforeEach(async () => {
            const warningConfig: Partial<PolarisServerOptions> = {
                shouldAddWarningsToExtensions: true,
            };
            polarisServer = await startTestServer(warningConfig);
        });

        afterEach(async () => {
            await stopTestServer(polarisServer);
        });

        it('warnings in the extensions of the response should be defined', async () => {
            const result = await graphqlRawRequest(booksWithWarnings.request);
            expect(result.extensions.warnings).toBeDefined();
        });

        it('the relevant warnings should be returned in the extensions of the response', async () => {
            const result = await graphqlRawRequest(booksWithWarnings.request);
            expect(result.extensions.warnings.length).toBe(2);
            expect(result.extensions.warnings[0]).toEqual('warning 1');
            expect(result.extensions.warnings[1]).toEqual('warning 2');
        });
    });
});
