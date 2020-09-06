import axios from 'axios';
import * as polarisProperties from '../server-without-connection/resources/polaris-properties.json';
import { createServersWithoutConnection } from '../tests-servers-util';

describe('whoami tests', () => {
    test.each(createServersWithoutConnection())(
        'get request for whoami endpoint, returning a valid response',
        async server => {
            await server.start();
            const url = `http://localhost:${polarisProperties.port}/whoami`;
            const result = await axios(url);
            expect(result.data.service).toBe(polarisProperties.name);
            expect(result.data.version).toBe(polarisProperties.version);
            await server.stop();
        },
    );
});
