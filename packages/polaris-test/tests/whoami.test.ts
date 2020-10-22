import axios from 'axios';
import * as polarisProperties from '../shared-resources/polaris-properties.json';
import { createServersWithoutConnection } from '../test-utils/tests-servers-util';
import { polarisTest } from '../test-utils/polaris-test';

describe('whoami tests', () => {
    test.each(createServersWithoutConnection())(
        'get request for whoami endpoint, returning a valid response',
        async (server) => {
            await polarisTest(server, async () => {
                const url = `http://localhost:${polarisProperties.port}/whoami`;
                const result = await axios(url);
                expect(result.data.service).toBe(polarisProperties.name);
                expect(result.data.version).toBe(polarisProperties.version);
            });
        },
    );
});
