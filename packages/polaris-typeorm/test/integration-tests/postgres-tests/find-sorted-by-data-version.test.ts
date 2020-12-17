import { PolarisConnection } from '../../../src';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Chapter } from '../../dal/chapter';
import { Pen } from '../../dal/pen';
import { color, harryPotter, rowling, setUpTestConnection } from '../utils/set-up';

let connection: PolarisConnection;
const mapping = new Map();
const mappingBooks = new Map();
const mappingPens = new Map();
const mappingChapters = new Map();

beforeEach(async () => {
    connection = await setUpTestConnection();
});
afterEach(async () => {
    await connection.close();
});
const createEntities = async (iterations: number = 15) => {
    for (let i = 0; i < iterations; i++) {
        const rowlingAuthor = new Author(rowling + i);
        const hpBook = new Book(harryPotter + i, rowlingAuthor);
        const chapter1 = new Chapter(1, hpBook);
        const pen = new Pen(color, rowlingAuthor);
        await connection.getRepository(Author).save({} as any, rowlingAuthor); // author dv 2
        await connection.getRepository(Book).save({} as any, hpBook); // book dv 3
        await connection.getRepository(Chapter).save({} as any, chapter1); // chapter dv 4
        await connection.getRepository(Pen).save({} as any, pen); // pen dv 5
    }
};

const dvContext = (dataVersion: number, pageSize?: number) => {
    return {
        onlinePaginatedContext: { pageSize },
        requestHeaders: { dataVersion },
        dataVersionContext: { mapping },
    } as any;
};
describe('find sorted by data version tests', () => {
    it('fetch authors, returns the correct amount, according to the page size', async () => {
        mappingBooks.set('books', undefined);
        mapping.set('Author', mappingBooks);
        await createEntities();
        const result = await connection
            .getRepository(Author)
            .findSortedByDataVersion(dvContext(1, 3));
        expect(result.length).toEqual(3);
    });
    it('fetch last page, returns correct amount', async () => {
        mappingBooks.set('books', undefined);
        mapping.set('Author', mappingBooks);
        await createEntities(5);
        const result = await connection
            .getRepository(Author)
            .findSortedByDataVersion(dvContext(13, 3));
        expect(result.length).toEqual(2);
    });
});
