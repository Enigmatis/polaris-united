import { PolarisServer, PolarisServerOptions } from '../../../src';
import { startTestServer, stopTestServer } from '../server/test-server';
import { graphqlRawRequest } from '../server/utils/graphql-client';
import * as allBooksWithWarnings from './jsonRequestsAndHeaders/allBooksWithWarnings.json';

let polarisServer: PolarisServer;

describe('warnings disabled tests', () => {
    describe('shouldAddWarningsToExtensions is false', () => {
        beforeEach(async () => {
            const warningConfig: Partial<PolarisServerOptions> = {
                shouldAddWarningsToExtensions: false,
            };
            polarisServer = await startTestServer(warningConfig);
        });

        afterEach(async () => {
            await stopTestServer(polarisServer);
        });

        it('should not return warnings in the extensions of the response', async () => {
            const result = await graphqlRawRequest(allBooksWithWarnings.request);
            expect(result.extensions.warnings).toBeUndefined();
        });
    });
});
