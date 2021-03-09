import { In, PolarisConnection } from '../../../src';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Chapter } from '../../dal/chapter';
import { Pen } from '../../dal/pen';
import { color, harryPotter, rowling, setUpTestConnection } from '../utils/set-up';

let connection: PolarisConnection;
const mapping = new Map();
const mappingBooks = new Map();

beforeEach(async () => {
    connection = await setUpTestConnection();
});
afterEach(async () => {
    await connection.close();
});
const createEntities = async (iterations: number = 15) => {
    for (let i = 0; i < iterations; i++) {
        const rowlingAuthor = new Author(rowling + i);
        rowlingAuthor.nickname = 'jk ' + i;
        const hpBook = new Book(harryPotter + i, rowlingAuthor);
        const chapter1 = new Chapter(1, hpBook);
        const pen = new Pen(color, rowlingAuthor);
        let context = contextInit('a' + i);
        await connection.getRepository(Author, context).save(rowlingAuthor); // author dv 2
        connection.removePolarisEntityManagerWithContext(context);
        context = contextInit('b' + i);
        await connection.getRepository(Book, context).save(hpBook); // book dv 3
        connection.removePolarisEntityManagerWithContext(context);
        context = contextInit('c' + i);
        await connection.getRepository(Chapter, context).save(chapter1); // chapter dv 4
        connection.removePolarisEntityManagerWithContext(context);
        context = contextInit('d' + i);
        await connection.getRepository(Pen, context).save(pen); // pen dv 5
        connection.removePolarisEntityManagerWithContext(context);
    }
};

const contextInit = (requestId: string) => {
    return {
        requestHeaders: { requestId },
    } as any;
};
const dvContext = (dataVersion: number, pageSize: number) => {
    return {
        request: { query: 'query {}' },
        onlinePaginatedContext: { pageSize },
        requestHeaders: { dataVersion, requestId: new Date().valueOf().toString() },
        dataVersionContext: { mapping },
    } as any;
};
describe('find sorted by data version tests', () => {
    it('fetch authors, returns the correct amount, according to the page size', async () => {
        mappingBooks.set('books', undefined);
        mapping.set('Author', mappingBooks);
        await createEntities();
        const result = await connection
            .getRepository(Author, dvContext(1, 3))
            .findSortedByDataVersion();
        expect(result.length).toEqual(3);
    });
    it('fetch authors, add where or conditions, return according to the page size & conditions', async () => {
        // mapping.set('Author', undefined);
        mappingBooks.set('books', undefined);
        mapping.set('Author', mappingBooks);
        await createEntities(7);
        const whereOrConditions = [
            { name: In([rowling + '0', rowling + '1', rowling + '2']) },
            { nickname: In(['jk 3', 'jk 4']) },
        ];
        const result = await connection
            .getRepository(Author, dvContext(1, 3))
            .findSortedByDataVersion({
                where: whereOrConditions,
            });
        const result2 = await connection
            .getRepository(Author, dvContext(11, 3))
            .findSortedByDataVersion({
                where: whereOrConditions,
            });
        expect(result.length).toEqual(3);
        expect(result2.length).toEqual(2);
    });
    it('fetch last page, returns correct amount', async () => {
        mappingBooks.set('books', undefined);
        mapping.set('Author', mappingBooks);
        await createEntities(5);
        const result = await connection
            .getRepository(Author, dvContext(13, 3))
            .findSortedByDataVersion();
        expect(result.length).toEqual(2);
    });
    it('fetch all heroes in two pages, returns correctly', async () => {
        mappingBooks.set('books', undefined);
        mapping.set('Author', mappingBooks);
        await createEntities(5);
        const allHeroes = await connection
            .getRepository(Author, dvContext(1, 5))
            .findSortedByDataVersion();
        const firstThree = await connection
            .getRepository(Author, dvContext(1, 3))
            .findSortedByDataVersion();
        const lastTwo = await connection
            .getRepository(Author, dvContext(13, 2))
            .findSortedByDataVersion();
        expect(allHeroes).toEqual([...firstThree, ...lastTwo]);
    });
    it('fetch all heroes in two pages with only root entity, returns correctly', async () => {
        mapping.set('Author', undefined);
        await createEntities(5);
        const allHeroes = await connection
            .getRepository(Author, dvContext(1, 5))
            .findSortedByDataVersion();
        const firstThree = await connection
            .getRepository(Author, dvContext(1, 3))
            .findSortedByDataVersion();
        const lastTwo = await connection
            .getRepository(Author, dvContext(13, 2))
            .findSortedByDataVersion();
        expect(allHeroes).toEqual([...firstThree, ...lastTwo]);
    });
});
