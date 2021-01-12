import {
    PolarisExtensions,
    PolarisGraphQLContext,
    PolarisRequestHeaders,
} from '@enigmatis/polaris-common';
import { PolarisLogger } from '@enigmatis/polaris-logs';
import { createPolarisConnection, PolarisConnection } from '../../../src';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Library } from '../../dal/library';
import { Profile } from '../../dal/profile';
import { User } from '../../dal/user';
import { applicationLogProperties, connectionOptions, loggerConfig } from './test-properties';

export const gender: string = 'female';
export const userName: string = 'chen';
export const rowling = 'J.K Rowling';
export const mrCascade = 'Mr Cascade';
export const harryPotter = 'Harry Potter and the Chamber of Secrets';
export const cascadeBook = 'Cascade Book';
export const color = 'Red';

export const setUpTestConnection = async (): Promise<PolarisConnection> => {
    const polarisGraphQLLogger = await new PolarisLogger(loggerConfig, applicationLogProperties);
    return createPolarisConnection(connectionOptions, polarisGraphQLLogger);
};

export const initDb = async (connection: PolarisConnection) => {
    const context = { requestHeaders: { realityId: 0 } } as any;
    const hpBook = new Book(harryPotter);
    const cbBook = new Book(cascadeBook);
    const rowlingAuthor = new Author(rowling, [hpBook]);
    const cascadeAuthor = new Author(mrCascade, [cbBook]);
    cbBook.author = cascadeAuthor;
    const profile: Profile = new Profile(gender);

    await connection.getRepository(Profile, context).save(profile);
    await connection.getRepository(User, context).save(new User(userName, profile));
    await connection.getRepository(Author, context).save([rowlingAuthor, cascadeAuthor]);
    await connection.getRepository(Book, context).save([hpBook, cbBook]);
    await connection.getRepository(Library, context).save(new Library('public', [cbBook]));
};

export function generateContext(
    headers?: PolarisRequestHeaders,
    extensions?: PolarisExtensions,
): PolarisGraphQLContext {
    return {
        requestHeaders: headers || { requestId: new Date().valueOf().toString() },
        returnedExtensions: extensions || {},
    } as PolarisGraphQLContext;
}
