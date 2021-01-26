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
const createAuthorAndBook = async () => {
    const rowlingAuthor = new Author(rowling);
    const hpBook = new Book(harryPotter, rowlingAuthor);
    await connection.getRepository(Author).save({} as any, rowlingAuthor); // author dv 2
    await connection.getRepository(Book).save({} as any, hpBook); // book dv 3
    return { author: rowlingAuthor, book: hpBook };
};
const createChapter = async (book: Book) => {
    const chapter1 = new Chapter(1, book);
    await connection.getRepository(Chapter).save({} as any, chapter1); // chapter dv 4
};
const createPen = async (author: Author) => {
    const pen = new Pen(color, author);
    await connection.getRepository(Pen).save({} as any, pen); // pen dv 5
};
const dvContext = (dataVersion: number) => {
    return {
        requestHeaders: { dataVersion },
        dataVersionContext: { mapping },
    } as any;
};
describe('data version specification tests', () => {
    describe('testing filter with changed mapping', () => {
        it('only root entity in mapping, ask with dv equal to root dv, entity is not returned', async () => {
            mapping.set('Author', undefined);
            await createAuthorAndBook();
            const result = await connection.getRepository(Author).find(dvContext(2));
            expect(result.length).toEqual(0);
        });
        it('only root entity in mapping, ask with dv smaller than root dv, entity is returned', async () => {
            mapping.set('Author', undefined);
            await createAuthorAndBook();
            const result = await connection.getRepository(Author).find(dvContext(1));
            expect(result.length).toEqual(1);
        });
        it('ask with dv grandChild dv, grandchild not in mapping, entity is not returned', async () => {
            mappingBooks.set('books', undefined);
            mapping.set('Author', mappingBooks);
            const { book } = await createAuthorAndBook();
            await createChapter(book);
            const result = await connection.getRepository(Author).find(dvContext(3));
            expect(result.length).toEqual(0);
        });
        it('pen entity not in mapping, ask with dv smaller than pen, entity is not returned', async () => {
            mappingChapters.set('chapters', undefined);
            mappingBooks.set('books', mappingChapters);
            mapping.set('Author', mappingBooks);
            const { book, author } = await createAuthorAndBook();
            await createChapter(book);
            await createPen(author);
            const result = await connection.getRepository(Author).find(dvContext(4));
            expect(result.length).toEqual(0);
        });
    });
    describe('testing filter, all fields are mapped', () => {
        beforeAll(() => {
            mappingChapters.set('chapters', undefined);
            mappingPens.set('pens', undefined);
            mappingBooks.set('books', mappingChapters);
            mapping.set('Author', [mappingBooks, mappingPens]);
        });
        it('ask with root dv, entity is returned', async () => {
            await createAuthorAndBook();
            const result = await connection.getRepository(Author).find(dvContext(1));
            expect(result.length).toEqual(1);
        });
        it('ask with child dv, entity is returned', async () => {
            await createAuthorAndBook();
            const result = await connection.getRepository(Author).find(dvContext(1));
            expect(result.length).toEqual(1);
        });
        it('ask with dv grandChild dv, entity is returned', async () => {
            const { book } = await createAuthorAndBook();
            await createChapter(book);
            const result = await connection.getRepository(Author).find(dvContext(3));
            expect(result.length).toEqual(1);
        });
        it('ask with dv bigger than grandChild dv, entity is not returned', async () => {
            const { book } = await createAuthorAndBook();
            await createChapter(book);
            const result = await connection.getRepository(Author).find(dvContext(4));
            expect(result.length).toEqual(0);
        });
        it('ask with dv of second child entity, entity is returned', async () => {
            const { author, book } = await createAuthorAndBook();
            await createChapter(book);
            await createPen(author);
            const result = await connection.getRepository(Author).find(dvContext(4));
            expect(result.length).toEqual(1);
        });
    });
});
