import { PolarisServerOptions } from '@enigmatis/polaris-core';
import { graphqlRawRequest } from '../server/utils/graphql-client';
import { createServers } from '../tests-servers-util';
import * as allBooksWithWarnings from './jsonRequestsAndHeaders/allBooksWithWarnings.json';

const warningConfig: Partial<PolarisServerOptions> = {
    shouldAddWarningsToExtensions: false,
};

describe('warnings disabled tests', () => {
    describe('shouldAddWarningsToExtensions is false', () => {
        test.each(createServers(warningConfig))(
            'should not return warnings in the extensions of the response',
            async server => {
                await server.start();
                const result = await graphqlRawRequest(allBooksWithWarnings.request);
                expect(result.extensions.warnings).toBeUndefined();
                await server.stop();
            },
        );
    });
});
