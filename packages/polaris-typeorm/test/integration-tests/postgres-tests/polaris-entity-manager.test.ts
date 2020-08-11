import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisLogger } from '@enigmatis/polaris-logs';
import { ConnectionOptions } from 'typeorm';
import { createPolarisConnection, PolarisConnection, PolarisRepository } from '../../../src';
import { Book } from '../../dal/book';
import { generateContext } from '../utils/set-up';
import {
    applicationLogProperties,
    connectionOptions,
    loggerConfig,
} from '../utils/test-properties';

let logger: PolarisLogger;
let connection: PolarisConnection;
let testConnection: PolarisConnection;
let bookRepo: PolarisRepository<Book>;
let book: Book;
let testBookRepo: PolarisRepository<Book>;
const bookTitle = 'the bible';
let contextWithRealityName: PolarisGraphQLContext;

beforeEach(async () => {
    logger = await new PolarisLogger(loggerConfig, applicationLogProperties);
    connection = await createPolarisConnection(connectionOptions, logger);
    testConnection = await createPolarisConnection(
        {
            ...connectionOptions,
            name: process.env.NEW_SCHEMA_NAME,
            schema: process.env.NEW_SCHEMA_NAME,
        } as ConnectionOptions,
        logger,
    );
    bookRepo = connection.getRepository(Book);
    testBookRepo = testConnection.getRepository(Book);
    contextWithRealityName = generateContext();
    contextWithRealityName.reality = { id: 0, name: process.env.SCHEMA_NAME };
    book = new Book(bookTitle);
});
afterEach(async () => {
    await connection.close();
    await testConnection.close();
});

describe('polaris entity manager', () => {
    describe('schema is changed by reality name in context', () => {
        it('save book on new connection, get it on previous connection', async () => {
            await testBookRepo.save(contextWithRealityName, [book]);
            const book2 = await bookRepo.findOne(contextWithRealityName, {
                where: { title: bookTitle },
            });
            expect(book2).toEqual(book);
        });

        it('update book on new connection, get it on previous connection', async () => {
            await bookRepo.save(contextWithRealityName, [book]);
            const newTitle = 'why man love bitches';
            await testBookRepo.update(contextWithRealityName, book.getId(), { title: newTitle });
            const bookAfterUpdate = await bookRepo.find(contextWithRealityName, {
                where: { id: book.getId() },
            });
            expect(bookAfterUpdate).toHaveLength(1);
            expect(bookAfterUpdate[0].title).toEqual(newTitle);
        });

        it('delete book on new connection, dont get it on previous connection', async () => {
            await bookRepo.save(contextWithRealityName, [book]);
            const bookBeforeDelete = await bookRepo.findOne(contextWithRealityName, {
                where: { title: bookTitle },
            });
            expect(bookBeforeDelete).toEqual(book);
            await testBookRepo.delete(contextWithRealityName, book.getId());
            const bookAfterDelete = await bookRepo.findOne(contextWithRealityName, {
                where: { id: book.getId() },
            });
            expect(bookAfterDelete).toBeUndefined();
        });
        it('create book on previous connection, find it on new connection', async () => {
            await bookRepo.save(contextWithRealityName, [book]);
            const books = await testBookRepo.find(contextWithRealityName, {
                where: { title: bookTitle },
            });
            expect(books).toHaveLength(1);
            expect(books[0]).toEqual(book);
        });
        it('create book on previous connection, find one on new connection', async () => {
            await bookRepo.save(contextWithRealityName, [book]);
            const bookFromTest = await testBookRepo.findOne(contextWithRealityName, {
                where: { title: bookTitle },
            });
            expect(bookFromTest).toEqual(book);
        });
        it('create book on previous connection, count books on new connection', async () => {
            await bookRepo.save(contextWithRealityName, [book]);
            const bookFromTest = await testBookRepo.count(contextWithRealityName, {
                where: { title: bookTitle },
            });
            expect(bookFromTest).toEqual(1);
        });
        it(
            'create two books on the test connection with different schemas,' +
                ' creating them on the schema in the contextWithRealityName',
            async () => {
                const book2 = new Book(bookTitle + ' 2');
                await testBookRepo.save(generateContext(), [book]);
                await bookRepo.save(generateContext(), [book2]);
                const bookFromSchema = await testBookRepo.findOne(generateContext(), {
                    where: { id: book.getId() },
                });
                const bookFromNewSchema = await testBookRepo.findOne(contextWithRealityName, {
                    where: { id: book2.getId() },
                });
                expect(bookFromSchema?.title).toEqual(book.title);
                expect(bookFromNewSchema?.title).toEqual(book2.title);
            },
        );
    });
});
