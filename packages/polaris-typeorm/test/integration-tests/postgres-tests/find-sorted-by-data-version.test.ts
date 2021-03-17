import { In, PolarisConnection } from '../../../src';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Chapter } from '../../dal/chapter';
import { Pen } from '../../dal/pen';
import { color, harryPotter, rowling, setUpTestConnection } from '../utils/set-up';

const joinOptions: string[] = ['inner-join', 'left-join'];
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
    it.each(joinOptions)(
        'fetch authors, returns the correct amount, according to the page size',
        async (join) => {
            mappingBooks.set('books', undefined);
            mapping.set('Author', mappingBooks);
            await createEntities();
            const repository = connection.getRepository(Author, dvContext(1, 3));
            const result =
                join === joinOptions[0]
                    ? await repository.findSortedByDataVersionUsingInnerJoin()
                    : await repository.findSortedByDataVersionUsingLeftOuterJoin();
            expect(result.length).toEqual(3);
        },
    );

    it.each(joinOptions)(
        'fetch authors, add where or conditions, return according to the page size & conditions',
        async (join) => {
            mappingBooks.set('books', undefined);
            mapping.set('Author', mappingBooks);
            await createEntities(7);
            const repository = await connection.getRepository(Author, dvContext(1, 3));
            const whereCondition = {
                where: [
                    { name: In([rowling + '0', rowling + '1', rowling + '2']) },
                    { nickname: In(['jk 3', 'jk 4']) },
                ],
            };
            const result =
                join === joinOptions[0]
                    ? await repository.findSortedByDataVersionUsingInnerJoin(whereCondition)
                    : await repository.findSortedByDataVersionUsingLeftOuterJoin(whereCondition);
            const repository2 = await connection.getRepository(Author, dvContext(11, 3));
            const result2 =
                join === joinOptions[0]
                    ? await repository2.findSortedByDataVersionUsingInnerJoin(whereCondition)
                    : await repository2.findSortedByDataVersionUsingLeftOuterJoin(whereCondition);
            expect(result.length).toEqual(3);
            expect(result2.length).toEqual(2);
        },
    );
    it.each(joinOptions)('fetch last page, returns correct amount', async (join) => {
        mappingBooks.set('books', undefined);
        mapping.set('Author', mappingBooks);
        await createEntities(5);
        const repository = connection.getRepository(Author, dvContext(13, 3));
        const result =
            join === joinOptions[0]
                ? await repository.findSortedByDataVersionUsingInnerJoin()
                : await repository.findSortedByDataVersionUsingLeftOuterJoin();
        expect(result.length).toEqual(2);
    });
    it.each(joinOptions)('fetch all heroes in two pages, returns correctly', async (join) => {
        mappingBooks.set('books', undefined);
        mapping.set('Author', mappingBooks);
        await createEntities(5);
        const allHeroesRepository = connection.getRepository(Author, dvContext(1, 5));
        const allHeroes =
            join === joinOptions[0]
                ? await allHeroesRepository.findSortedByDataVersionUsingInnerJoin()
                : await allHeroesRepository.findSortedByDataVersionUsingLeftOuterJoin();
        const firstThreeRepository = connection.getRepository(Author, dvContext(1, 3));
        const firstThree =
            join === joinOptions[0]
                ? await firstThreeRepository.findSortedByDataVersionUsingInnerJoin()
                : await firstThreeRepository.findSortedByDataVersionUsingLeftOuterJoin();
        const lastTwoRepository = connection.getRepository(Author, dvContext(13, 2));
        const lastTwo =
            join === joinOptions[0]
                ? await lastTwoRepository.findSortedByDataVersionUsingInnerJoin()
                : await lastTwoRepository.findSortedByDataVersionUsingLeftOuterJoin();
        expect(allHeroes).toEqual([...firstThree, ...lastTwo]);
    });
    it.each(joinOptions)(
        'fetch all heroes in two pages with only root entity, returns correctly',
        async (join) => {
            mapping.set('Author', undefined);
            await createEntities(5);
            const allHeroesRepository = connection.getRepository(Author, dvContext(1, 5));
            const allHeroes =
                join === joinOptions[0]
                    ? await allHeroesRepository.findSortedByDataVersionUsingInnerJoin()
                    : await allHeroesRepository.findSortedByDataVersionUsingLeftOuterJoin();
            const firstThreeRepository = connection.getRepository(Author, dvContext(1, 3));
            const firstThree =
                join === joinOptions[0]
                    ? await firstThreeRepository.findSortedByDataVersionUsingInnerJoin()
                    : await firstThreeRepository.findSortedByDataVersionUsingLeftOuterJoin();
            const lastTwoRepository = connection.getRepository(Author, dvContext(13, 2));
            const lastTwo =
                join === joinOptions[0]
                    ? await lastTwoRepository.findSortedByDataVersionUsingInnerJoin()
                    : await lastTwoRepository.findSortedByDataVersionUsingLeftOuterJoin();
            expect(allHeroes).toEqual([...firstThree, ...lastTwo]);
        },
    );
});
