import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { graphqlRawRequest } from '../test-utils/graphql-client';
import { createServers } from '../test-utils/tests-servers-util';
import * as allBooksWithWarnings from './jsonRequestsAndHeaders/allBooksWithWarnings.json';
import { polarisTest } from '../test-utils/polaris-test';

const warningConfig: Partial<PolarisServerOptions> = {
    shouldAddWarningsToExtensions: false,
};

describe('warnings disabled tests', () => {
    describe('shouldAddWarningsToExtensions is false', () => {
        test.each(createServers(warningConfig))(
            'should not return warnings in the extensions of the response',
            async (server) => {
                await polarisTest(server, async () => {
                    const result = await graphqlRawRequest(allBooksWithWarnings.request);
                    expect(result.extensions.warnings).toBeUndefined();
                });
            },
        );
    });
});
