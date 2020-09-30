import { PolarisConnection, PolarisRepository, SelectQueryBuilder } from '../../../src';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { harryPotter, rowling, setHeaders, setUpTestConnection } from '../utils/set-up';
import { Chapter } from '../../dal/chapter';
import { dataVersionFilter } from '../../../src/handlers/data-version-handler';

let connection: PolarisConnection;
let authorRepo: PolarisRepository<Author>;
let bookRepo: PolarisRepository<Book>;
let chapterRepo: PolarisRepository<Chapter>;
let qb: SelectQueryBuilder<any>;
const context = { requestHeaders: { dataVersion: 1 } } as any;
const context2 = { requestHeaders: { dataVersion: 2 } } as any;
const context3 = { requestHeaders: { dataVersion: 3 } } as any;
const context4 = { requestHeaders: { dataVersion: 4 } } as any;

beforeEach(async () => {
    connection = await setUpTestConnection();
    authorRepo = connection.getRepository(Author);
    bookRepo = connection.getRepository(Book);
    chapterRepo = connection.getRepository(Chapter);
    setHeaders(connection, { res: { locals: {} } } as any);
    qb = authorRepo.createQueryBuilder('author');
});
afterEach(async () => {
    await connection.close();
});
describe('data version specification tests', () => {
    it('ask with root dv, entity is returned', async () => {
        const hpBook = new Book(harryPotter);
        const rowlingAuthor = new Author(rowling, [hpBook]);
        // dv 1
        await authorRepo.save({} as any, rowlingAuthor);
        hpBook.author = rowlingAuthor;
        // author dv 2
        await bookRepo.save({} as any, hpBook);
        // book dv 3
        const x = await dataVersionFilter(connection, qb, 'author', context).getMany();
        expect(x.length).toEqual(1);
    });
    it('ask with child dv, entity is returned', async () => {
        const hpBook = new Book(harryPotter);
        const rowlingAuthor = new Author(rowling, [hpBook]);
        // dv 1
        await authorRepo.save({} as any, rowlingAuthor);
        hpBook.author = rowlingAuthor;
        // author dv 2
        await bookRepo.save({} as any, hpBook);
        // book dv 3
        const x = await dataVersionFilter(connection, qb, 'author', context2).getMany();
        expect(x.length).toEqual(1);
    });
    it('ask with dv grandChild dv, entity is returned', async () => {
        const hpBook = new Book(harryPotter);
        const rowlingAuthor = new Author(rowling, [hpBook]);
        const chapter1 = new Chapter(1, hpBook);
        // dv 1
        await authorRepo.save({} as any, rowlingAuthor);
        hpBook.author = rowlingAuthor;
        // author dv 2
        await bookRepo.save({} as any, hpBook);
        // book dv 3
        await chapterRepo.save({} as any, chapter1);
        // chapter dv 4
        const x = await dataVersionFilter(connection, qb, 'author', context3).getMany();
        expect(x.length).toEqual(1);
    });
    it('ask with dv bigger than grandChild dv, entity is not returned', async () => {
        const hpBook = new Book(harryPotter);
        const rowlingAuthor = new Author(rowling, [hpBook]);
        const chapter1 = new Chapter(1, hpBook);
        // dv 1
        await authorRepo.save({} as any, rowlingAuthor);
        hpBook.author = rowlingAuthor;
        // author dv 2
        await bookRepo.save({} as any, hpBook);
        // book dv 3
        await chapterRepo.save({} as any, chapter1);
        // chapter dv 4
        const x = await dataVersionFilter(connection, qb, 'author', context4).getMany();
        expect(x.length).toEqual(0);
    });
});
