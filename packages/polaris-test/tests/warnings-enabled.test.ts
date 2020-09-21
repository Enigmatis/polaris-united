import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { graphqlRawRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as booksWithWarnings from './jsonRequestsAndHeaders/allBooksWithWarnings.json';

const warningConfig: Partial<PolarisServerOptions> = {
    shouldAddWarningsToExtensions: true,
};
describe('warnings enabled tests', () => {
    describe('shouldAddWarningsToExtensions is true', () => {
        test.each(createServers(warningConfig))(
            'warnings in the extensions of the response should be defined',
            async (server) => {
                await server.start();
                const result = await graphqlRawRequest(booksWithWarnings.request);
                expect(result.extensions.warnings).toBeDefined();
                await server.stop();
            },
        );
        test.each(createServers(warningConfig))(
            'the relevant warnings should be returned in the extensions of the response',
            async (server) => {
                await server.start();
                const result = await graphqlRawRequest(booksWithWarnings.request);
                expect(result.extensions.warnings.length).toBe(2);
                expect(result.extensions.warnings[0]).toEqual('warning 1');
                expect(result.extensions.warnings[1]).toEqual('warning 2');
                await server.stop();
            },
        );
    });
});
