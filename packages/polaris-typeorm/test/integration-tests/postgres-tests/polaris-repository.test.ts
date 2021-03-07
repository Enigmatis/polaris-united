import { DataVersion, In, PolarisConnection, PolarisRepository } from '../../../src';
import { Author } from '../../dal/author';
import { Book } from '../../dal/book';
import { Cookbook } from '../../dal/cookbook';
import { Library } from '../../dal/library';
import { Profile } from '../../dal/profile';
import { User } from '../../dal/user';
import {
    cascadeBook,
    gender,
    generateContext,
    harryPotter,
    initDb,
    mrCascade,
    rowling,
    setUpTestConnection,
    userName,
} from '../utils/set-up';

const bookFindOneOptions = { where: { title: harryPotter } };
const authorFindOneOptions = { where: { name: rowling } };
const bookWithCascadeFindOneOptions = { where: { title: cascadeBook } };
const authorWithCascadeFindOneOptions = { where: { name: mrCascade } };
const userFindOneOptions = { where: { name: userName } };
const profileFindOneOptions = { where: { gender } };

let connection: PolarisConnection;
let authorRepo: PolarisRepository<Author>;
let bookRepo: PolarisRepository<Book>;
let cookbookRepo: PolarisRepository<Cookbook>;
let profileRepo: PolarisRepository<Profile>;
let userRepo: PolarisRepository<User>;
let dvRepo: PolarisRepository<DataVersion>;
let libraryRepo: PolarisRepository<Library>;

beforeEach(async () => {
    connection = await setUpTestConnection();
    authorRepo = connection.getRepository(Author, generateContext());
    bookRepo = connection.getRepository(Book, generateContext());
    profileRepo = connection.getRepository(Profile, generateContext());
    userRepo = connection.getRepository(User, generateContext());
    dvRepo = connection.getRepository(DataVersion, generateContext());
    libraryRepo = connection.getRepository(Library, generateContext());
    cookbookRepo = connection.getRepository(Cookbook, generateContext());
    await initDb(connection);
});
afterEach(async () => {
    await connection.close();
});

describe('entity manager tests', () => {
    describe('soft delete tests', () => {
        it('parent is not common model, hard delete parent entity', async () => {
            const findConditions = { name: 'public' };
            const findOptions = { where: findConditions };
            await libraryRepo.delete(findConditions);
            const libAfterDelete = await libraryRepo.findOne(findOptions);
            expect(libAfterDelete).toBeUndefined();
        });

        it('field is not common model, does not delete linked entity', async () => {
            await authorRepo.delete(authorWithCascadeFindOneOptions.where);
            const lib = await libraryRepo.findOne({
                relations: ['books'],
            });
            const criteria = {
                where: {
                    ...authorWithCascadeFindOneOptions.where,
                    deleted: In([true, false]),
                },
            };
            const authorWithCascade = await authorRepo.findOne(criteria);
            expect(lib).toBeDefined();
            authorWithCascade
                ? expect(authorWithCascade.getDeleted()).toBeTruthy()
                : expect(authorWithCascade).toBeDefined();
        });

        it('parent and field are common models but cascade is not on, does not delete linked entity', async () => {
            const criteria = {
                where: { ...userFindOneOptions.where, deleted: In([true, false]) },
                relations: ['profile'],
            };
            await userRepo.delete(criteria.where);
            const userCommonModel = await userRepo.findOne(criteria);
            userCommonModel
                ? expect(userCommonModel.getDeleted()).toBeTruthy()
                : expect(userCommonModel).toBeDefined();
            userCommonModel
                ? userCommonModel.profile
                    ? expect(userCommonModel.profile.getDeleted()).toBeFalsy()
                    : expect(userCommonModel.profile).toBeDefined()
                : expect(userCommonModel).toBeDefined();
        });

        it('field is common model and cascade is on, delete linked entity', async () => {
            const authorFindOneOptions1 = {
                where: {
                    ...authorWithCascadeFindOneOptions.where,
                    deleted: In([true, false]),
                },
                relations: ['books'],
            };
            const bookFindOneOptions1 = {
                where: {
                    ...bookWithCascadeFindOneOptions.where,
                    deleted: In([true, false]),
                },
            };
            await authorRepo.delete(authorFindOneOptions1.where);
            const authorWithCascade: Author | undefined = await authorRepo.findOne(
                authorFindOneOptions1,
            );
            const bookWithCascade: Book | undefined = await bookRepo.findOne(bookFindOneOptions1);
            bookWithCascade
                ? expect(bookWithCascade.getDeleted()).toBeTruthy()
                : expect(bookWithCascade).toBeDefined();
            authorWithCascade
                ? expect(authorWithCascade.getDeleted()).toBeTruthy()
                : expect(bookWithCascade).toBeDefined();
        });

        it('delete linked entity, should not return deleted entities(first level), get entity and its linked entity', async () => {
            await profileRepo.delete(profileFindOneOptions.where);
            const userEntity: User | undefined = await userRepo.findOne({
                ...userFindOneOptions,
                relations: ['profile'],
            });
            if (userEntity?.profile) {
                expect(userEntity.profile.getDeleted()).toBeTruthy();
                expect(userEntity.getDeleted()).toBeFalsy();
            } else {
                expect(userEntity).toBeDefined();
            }
        });

        // checks default setting
        it('delete entity, should not return deleted entities, doesnt return deleted entity', async () => {
            await bookRepo.delete(bookFindOneOptions.where);
            const book: Book | undefined = await bookRepo.findOne(bookFindOneOptions);
            expect(book).toBeUndefined();
        });

        // checks soft delete allow false
        it('delete entity, soft delete allow is false and return deleted entities true, doesnt return deleted entity', async () => {
            Object.assign(connection.options, {
                extra: { config: { allowSoftDelete: false } },
            });
            await authorRepo.delete(authorFindOneOptions.where);
            const author: Author | undefined = await authorRepo.findOne({
                where: {
                    ...authorFindOneOptions.where,
                    deleted: In([true, false]),
                },
            });
            expect(author).toBeUndefined();
            delete connection.options.extra.config.allowSoftDelete;
        });

        // checks soft delete allow false with cascade
        it(
            'delete entity, soft delete allow is false and return deleted entities true and cascade is true,' +
                ' doesnt return deleted entity and its linked entity',
            async () => {
                Object.assign(connection.options, {
                    extra: { config: { allowSoftDelete: false } },
                });
                await authorRepo.delete(authorWithCascadeFindOneOptions.where);
                const bookWithCascade = await bookRepo.findOne({
                    where: {
                        ...bookWithCascadeFindOneOptions.where,
                        deleted: In([true, false]),
                    },
                });
                const authorWithCascade = await authorRepo.findOne({
                    where: {
                        ...authorWithCascadeFindOneOptions.where,
                        deleted: In([true, false]),
                    },
                });
                expect(bookWithCascade).toBeUndefined();
                expect(authorWithCascade).toBeUndefined();
                delete connection.options.extra.config.allowSoftDelete;
            },
        );
    });
    describe('data version tests', () => {
        it('books are created with data version, get all book for data version 0', async () => {
            const booksInit = await bookRepo.find({});
            bookRepo = connection.getRepository(Book, generateContext({ dataVersion: 2 }));
            const booksAfterDataVersion = await bookRepo.find({});
            expect(booksInit.length).toEqual(2);
            expect(booksAfterDataVersion.length).toEqual(0);
        });
    });
    describe('reality tests', () => {
        it('reality id is supplied in headers', async () => {
            const bookReality1: any = new Book('Jurassic Park');
            bookReality1.realityId = 1;
            bookRepo = connection.getRepository(Book, generateContext({ realityId: 1 }));
            await bookRepo.save(bookReality1);
            const book = await bookRepo.findOne({});
            expect(book).toEqual(bookReality1);
        });

        it('delete operational entity, linked oper header true and reality id is not operational, entity not deleted', async () => {
            bookRepo = connection.getRepository(Book, generateContext({ realityId: 1 }));
            try {
                await authorRepo.delete(authorFindOneOptions.where);
            } catch (err) {
                expect(err.message).toEqual('there are no entities to delete');
            }
        });

        it('save existing entity with different reality id, fail saving', async () => {
            const book: any = new Book('my book');
            await bookRepo.save(book);
            book.realityId = 1;
            bookRepo = connection.getRepository(Book, generateContext({ realityId: 1 }));
            try {
                await bookRepo.save(book);
            } catch (err) {
                expect(err.message).toEqual('reality id of entity is different from header');
            }
        });
    });
    it('find one with id', async () => {
        const book = new Book('my book');
        await bookRepo.save(book);
        const bookFound = await bookRepo.findOne({
            where: { id: book.getId() },
        });
        expect(book).toEqual(bookFound);
    });
    it('count', async () => {
        expect(await bookRepo.count({})).toEqual(2);
    });
    it('order by', async () => {
        const books1 = await bookRepo.find({
            order: {
                title: 'ASC',
            },
        });
        expect(books1[0].title).toEqual(cascadeBook);
        expect(books1[1].title).toEqual(harryPotter);
    });
    it('save and update entity with upn, createdBy and lastUpdatedBy is updated accordingly', async () => {
        const book = new Book('my book');

        const createdByUpn = 'foo';
        bookRepo = connection.getRepository(Book, generateContext({ upn: createdByUpn }));
        await bookRepo.save(book);
        expect(book.getCreatedBy()).toBe(createdByUpn);
        expect(book.getLastUpdatedBy()).toBe(createdByUpn);

        const updatedByUpn = 'bar';
        bookRepo = connection.getRepository(Book, generateContext({ upn: updatedByUpn }));
        await bookRepo.save(book);
        expect(book.getCreatedBy()).not.toBe(updatedByUpn);
        expect(book.getLastUpdatedBy()).toBe(updatedByUpn);
    });
    it('save and update entity with upn, entity already has creation time, createdBy and lastUpdatedBy is updated accordingly', async () => {
        const book = new Book('my book');

        const createdByUpn = 'foo';
        bookRepo = connection.getRepository(Book, generateContext({ upn: createdByUpn }));
        book.setCreationTime(new Date());
        await bookRepo.save(book);
        expect(book.getCreatedBy()).toBe(createdByUpn);
        expect(book.getLastUpdatedBy()).toBe(createdByUpn);
    });
    it('create grandchild entity with upn in context, upn is set to entity', async () => {
        const cookbook = new Cookbook('tasty food');
        const upn = 'foo';
        cookbookRepo = connection.getRepository(Cookbook, generateContext({ upn }));
        await cookbookRepo.save(cookbook);
        expect(cookbook.getCreatedBy()).toBe(upn);
    });
    it('save entity with upn, entity already has creation time, creation time is not overridden', async () => {
        const book = new Book('my book');

        const createdByUpn = 'foo';
        book.setCreationTime(new Date());
        const bookRepoWithHeaders = connection.getRepository(
            Book,
            generateContext({ upn: createdByUpn }),
        );
        await bookRepoWithHeaders.save(book);
        const bookFound = await bookRepo.findOne({
            where: { id: book.getId() },
        });
        const creationDate = bookFound?.getCreationTime();
        book.setCreationTime(new Date(1));
        await bookRepoWithHeaders.save(book);
        const bookFoundAfterCreationTimeChange = await bookRepo.findOne({
            where: { id: book.getId() },
        });
        expect(creationDate).not.toStrictEqual(bookFoundAfterCreationTimeChange?.getCreationTime());
    });
    describe('find by ids tests', () => {
        it('create entity find it by ids, returns entity', async () => {
            const book = new Book('my book');
            const bookRepoWithHeaders = connection.getRepository(
                Book,
                generateContext({ realityId: 0 }),
            );
            await bookRepo.save(book);
            const bookFound = await bookRepoWithHeaders.findByIds([book.getId()]);
            expect(bookFound[0]).toEqual(book);
        });
        it('delete entity then find it by ids, returns entity', async () => {
            const book = new Book('my book');
            await bookRepo.save(book);
            await bookRepo.delete(book.getId());
            bookRepo = connection.getRepository(Book, generateContext({ realityId: 0 }));
            const bookFound = await bookRepo.findByIds([book.getId()]);
            expect(bookFound[0]).toBeDefined();
        });
    });
    describe('query builder tests', () => {
        it('find one with id', async () => {
            const book = new Book('my book');
            await bookRepo.save(book);
            bookRepo = connection.getRepository(
                Book,
                generateContext({ realityId: 0, dataVersion: book.getDataVersion() - 1 }),
            );
            const bookFound = await bookRepo
                .createQueryBuilder('book')
                .andWhere('book.id = :id ', { id: book.getId() })
                .getOne();
            expect(bookFound?.getId()).toEqual(book.getId());
        });
        it('find one with data version equal to the entity, returns no entity', async () => {
            const book = new Book('my book');
            await bookRepo.save(book);
            bookRepo = connection.getRepository(
                Book,
                generateContext({ realityId: 0, dataVersion: book.getDataVersion() }),
            );
            const bookFound = await bookRepo
                .createQueryBuilder('book')
                .andWhere('book.id = :id ', { id: book.getId() })
                .getOne();
            expect(bookFound).toBeUndefined();
        });
        it('find deleted entity, returns no entity', async () => {
            const book = new Book('my book');
            await bookRepo.save(book);
            await bookRepo.delete(book.getId());
            bookRepo = connection.getRepository(Book, generateContext({ realityId: 0 }));
            const bookFound = await bookRepo
                .createQueryBuilder('book')
                .andWhere('book.id = :id ', { id: book.getId() })
                .getOne();
            expect(bookFound).toBeUndefined();
        });
    });
    it('save entity and related entity with reality id, both entities have requested reality id', async () => {
        const book: Book | undefined = new Book('foobar');
        const author = new Author('foo', [book]);
        authorRepo = connection.getRepository(Author, generateContext({ realityId: 1 }));
        await authorRepo.save(author);
        expect(author.books[0].getRealityId()).toBe(1);
    });
});
