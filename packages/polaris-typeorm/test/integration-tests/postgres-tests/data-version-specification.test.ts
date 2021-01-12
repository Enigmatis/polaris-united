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

    const authorContext = contextInit('author');
    await connection.getRepository(Author, authorContext).save(rowlingAuthor); // author dv 2
    connection.removePolarisEntityManagerWithContext(authorContext);

    const bookContext = contextInit('book');
    await connection.getRepository(Book, bookContext).save(hpBook); // book dv 3
    connection.removePolarisEntityManagerWithContext(bookContext);

    return { author: rowlingAuthor, book: hpBook };
};
const createChapter = async (book: Book) => {
    const chapter1 = new Chapter(1, book);
    const chapterContext = contextInit('chapter');
    await connection.getRepository(Chapter, chapterContext).save(chapter1); // chapter dv 4
    connection.removePolarisEntityManagerWithContext(chapterContext);
};
const createPen = async (author: Author) => {
    const pen = new Pen(color, author);
    const penContext = contextInit('pen');
    await connection.getRepository(Pen, penContext).save(pen); // pen dv 5
    connection.removePolarisEntityManagerWithContext(penContext);
};
const contextInit = (requestId: string) => {
    return {
        requestHeaders: { requestId },
    } as any;
};
const dvContext = (dataVersion: number) => {
    return {
        request: { query: 'query {}' },
        requestHeaders: { dataVersion, requestId: new Date().valueOf().toString() },
        dataVersionContext: { mapping },
    } as any;
};
describe('data version specification tests', () => {
    describe('testing filter with changed mapping', () => {
        it('only root entity in mapping, ask with dv equal to root dv, entity is not returned', async () => {
            mapping.set('Author', undefined);
            await createAuthorAndBook();
            const result = await connection.getRepository(Author, dvContext(2)).find();
            expect(result.length).toEqual(0);
        });
        it('only root entity in mapping, ask with dv smaller than root dv, entity is returned', async () => {
            mapping.set('Author', undefined);
            await createAuthorAndBook();
            const result = await connection.getRepository(Author, dvContext(1)).find();
            expect(result.length).toEqual(1);
        });
        it('ask with dv grandChild dv, grandchild not in mapping, entity is not returned', async () => {
            mappingBooks.set('books', undefined);
            mapping.set('Author', mappingBooks);
            const { book } = await createAuthorAndBook();
            await createChapter(book);
            const result = await connection.getRepository(Author, dvContext(3)).find();
            expect(result.length).toEqual(0);
        });
        it('pen entity not in mapping, ask with dv smaller than pen, entity is not returned', async () => {
            mappingChapters.set('chapters', undefined);
            mappingBooks.set('books', mappingChapters);
            mapping.set('Author', mappingBooks);
            const { book, author } = await createAuthorAndBook();
            await createChapter(book);
            await createPen(author);
            const result = await connection.getRepository(Author, dvContext(4)).find();
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
            const result = await connection.getRepository(Author, dvContext(1)).find();
            expect(result.length).toEqual(1);
        });
        it('ask with child dv, entity is returned', async () => {
            await createAuthorAndBook();
            const result = await connection.getRepository(Author, dvContext(1)).find();
            expect(result.length).toEqual(1);
        });
        it('ask with dv grandChild dv, entity is returned', async () => {
            const { book } = await createAuthorAndBook();
            await createChapter(book);
            const result = await connection.getRepository(Author, dvContext(3)).find();
            expect(result.length).toEqual(1);
        });
        it('ask with dv bigger than grandChild dv, entity is not returned', async () => {
            const { book } = await createAuthorAndBook();
            await createChapter(book);
            const result = await connection.getRepository(Author, dvContext(4)).find();
            expect(result.length).toEqual(0);
        });
        it('ask with dv of second child entity, entity is returned', async () => {
            const { author, book } = await createAuthorAndBook();
            await createChapter(book);
            await createPen(author);
            const result = await connection.getRepository(Author, dvContext(4)).find();
            expect(result.length).toEqual(1);
        });
    });
});
