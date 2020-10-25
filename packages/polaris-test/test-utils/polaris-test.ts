import { server } from './tests-servers-util';

export const polarisTest = async (testServer: server, test: () => void) => {
    await testServer.start();
    try {
        await test();
    } finally {
        await testServer.stop();
    }
};
