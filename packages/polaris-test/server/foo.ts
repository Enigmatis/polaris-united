import { startTestServer } from './test-server';

startTestServer()
    // tslint:disable-next-line:no-console
    .then((r) => console.log('server started'))
    // tslint:disable-next-line:no-console
    .catch((e) => console.log('R.I.P because of ' + e));
