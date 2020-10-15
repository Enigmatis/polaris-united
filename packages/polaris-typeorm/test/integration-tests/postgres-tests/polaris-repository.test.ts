import { DataVersion, PolarisConnection, PolarisRepository } from '../../../src';
import { getEntitiesIncludingDeletedConditions } from '../../../src/handlers/find-handler';
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
    authorRepo = connection.getRepository(Author);
    bookRepo = connection.getRepository(Book);
    profileRepo = connection.getRepository(Profile);
    userRepo = connection.getRepository(User);
    dvRepo = connection.getRepository(DataVersion);
    libraryRepo = connection.getRepository(Library);
    cookbookRepo = connection.getRepository(Cookbook);
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
            await libraryRepo.delete(generateContext(), findConditions);
            const libAfterDelete = await libraryRepo.findOne(generateContext(), findOptions);
            expect(libAfterDelete).toBeUndefined();
        });

        it('field is not common model, does not delete linked entity', async () => {
            await authorRepo.delete(generateContext(), authorWithCascadeFindOneOptions.where);
            const lib = await libraryRepo.findOne(generateContext(), {
                relations: ['books'],
            });
            const criteria = {
                where: {
                    ...authorWithCascadeFindOneOptions.where,
                    ...getEntitiesIncludingDeletedConditions,
                },
            };
            const authorWithCascade = await authorRepo.findOne(generateContext(), criteria);
            expect(lib).toBeDefined();
            authorWithCascade
                ? expect(authorWithCascade.getDeleted()).toBeTruthy()
                : expect(authorWithCascade).toBeDefined();
        });

        it('parent and field are common models but cascade is not on, does not delete linked entity', async () => {
            const criteria = {
                where: { ...userFindOneOptions.where, ...getEntitiesIncludingDeletedConditions },
                relations: ['profile'],
            };
            await userRepo.delete(generateContext(), criteria.where);
            const userCommonModel = await userRepo.findOne(generateContext(), criteria);
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
                    ...getEntitiesIncludingDeletedConditions,
                },
                relations: ['books'],
            };
            const bookFindOneOptions1 = {
                where: {
                    ...bookWithCascadeFindOneOptions.where,
                    ...getEntitiesIncludingDeletedConditions,
                },
            };
            await authorRepo.delete(generateContext(), authorFindOneOptions1.where);
            const authorWithCascade: Author | undefined = await authorRepo.findOne(
                generateContext(),
                authorFindOneOptions1,
            );
            const bookWithCascade: Book | undefined = await bookRepo.findOne(
                generateContext(),
                bookFindOneOptions1,
            );
            bookWithCascade
                ? expect(bookWithCascade.getDeleted()).toBeTruthy()
                : expect(bookWithCascade).toBeDefined();
            authorWithCascade
                ? expect(authorWithCascade.getDeleted()).toBeTruthy()
                : expect(bookWithCascade).toBeDefined();
        });

        it('delete linked entity, should not return deleted entities(first level), get entity and its linked entity', async () => {
            await profileRepo.delete(generateContext(), profileFindOneOptions.where);
            const userEntity: User | undefined = await userRepo.findOne(generateContext(), {
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
            await bookRepo.delete(generateContext(), bookFindOneOptions.where);
            const book: Book | undefined = await bookRepo.findOne(
                generateContext(),
                bookFindOneOptions,
            );
            expect(book).toBeUndefined();
        });

        // checks soft delete allow false
        it('delete entity, soft delete allow is false and return deleted entities true, doesnt return deleted entity', async () => {
            Object.assign(connection.options, {
                extra: { config: { allowSoftDelete: false } },
            });
            await authorRepo.delete(generateContext(), authorFindOneOptions.where);
            const author: Author | undefined = await authorRepo.findOne(generateContext(), {
                where: {
                    ...authorFindOneOptions.where,
                    ...getEntitiesIncludingDeletedConditions,
                },
            });
            expect(author).toBeUndefined();
        });

        // checks soft delete allow false with cascade
        it(
            'delete entity, soft delete allow is false and return deleted entities true and cascade is true,' +
                ' doesnt return deleted entity and its linked entity',
            async () => {
                Object.assign(connection.options, {
                    extra: { config: { allowSoftDelete: false } },
                });
                await authorRepo.delete(generateContext(), authorWithCascadeFindOneOptions.where);
                const bookWithCascade = await bookRepo.findOne(generateContext(), {
                    where: {
                        ...bookWithCascadeFindOneOptions.where,
                        ...getEntitiesIncludingDeletedConditions,
                    },
                });
                const authorWithCascade = await authorRepo.findOne(generateContext(), {
                    where: {
                        ...authorWithCascadeFindOneOptions.where,
                        ...getEntitiesIncludingDeletedConditions,
                    },
                });
                expect(bookWithCascade).toBeUndefined();
                expect(authorWithCascade).toBeUndefined();
            },
        );
    });
    describe('data version tests', () => {
        it('books are created with data version, get all book for data version 0', async () => {
            const booksInit = await bookRepo.find(generateContext(), {});
            const booksAfterDataVersion = await bookRepo.find(
                generateContext({ dataVersion: 2 }),
                {},
            );
            expect(booksInit.length).toEqual(2);
            expect(booksAfterDataVersion.length).toEqual(0);
        });
    });

    describe('reality tests', () => {
        it('reality id is supplied in headers', async () => {
            const bookReality1: any = new Book('Jurassic Park');
            bookReality1.realityId = 1;
            await bookRepo.save(generateContext({ realityId: 1 }), bookReality1);
            const book = await bookRepo.findOne(generateContext({ realityId: 1 }), {});
            expect(book).toEqual(bookReality1);
        });

        it('delete operational entity, linked oper header true and reality id isnt operational, entity not deleted', async () => {
            try {
                await authorRepo.delete(
                    generateContext({ realityId: 1 }),
                    authorFindOneOptions.where,
                );
            } catch (err) {
                expect(err.message).toEqual('there are no entities to delete');
            }
        });

        it('save existing entity with different reality id, fail saving', async () => {
            const book: any = new Book('my book');
            await bookRepo.save(generateContext(), book);
            book.realityId = 1;
            try {
                await bookRepo.save(generateContext({ realityId: 1 }), book);
            } catch (err) {
                expect(err.message).toEqual('reality id of entity is different from header');
            }
        });
    });
    it('find one with id', async () => {
        const book = new Book('my book');
        await bookRepo.save(generateContext(), book);
        const bookFound = await bookRepo.findOne(generateContext(), {
            where: { id: book.getId() },
        });
        expect(book).toEqual(bookFound);
    });

    it('count', async () => {
        expect(await bookRepo.count(generateContext(), {})).toEqual(2);
    });

    it('order by', async () => {
        const books1 = await bookRepo.find(generateContext(), {
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
        await bookRepo.save(generateContext({ upn: createdByUpn }), book);
        expect(book.getCreatedBy()).toBe(createdByUpn);
        expect(book.getLastUpdatedBy()).toBe(createdByUpn);

        const updatedByUpn = 'bar';
        await bookRepo.save(generateContext({ upn: updatedByUpn }), book);
        expect(book.getCreatedBy()).not.toBe(updatedByUpn);
        expect(book.getLastUpdatedBy()).toBe(updatedByUpn);
    });

    it('save and update entity with upn, entity already has creation time, createdBy and lastUpdatedBy is updated accordingly', async () => {
        const book = new Book('my book');

        const createdByUpn = 'foo';
        book.setCreationTime(new Date());
        await bookRepo.save(generateContext({ upn: createdByUpn }), book);
        expect(book.getCreatedBy()).toBe(createdByUpn);
        expect(book.getLastUpdatedBy()).toBe(createdByUpn);
    });
    it('create grandchild entity with upn in context, upn is set to entity', async () => {
        const cookbook = new Cookbook('tasty food');
        const upn = 'foo';
        await cookbookRepo.save(generateContext({ upn }), cookbook);
        expect(cookbook.getCreatedBy()).toBe(upn);
    });
    it('save entity with upn, entity already has creation time, creation time is not overridden', async () => {
        const book = new Book('my book');

        const createdByUpn = 'foo';
        book.setCreationTime(new Date());
        await bookRepo.save(generateContext({ upn: createdByUpn }), book);
        const bookFound = await bookRepo.findOne(generateContext(), {
            where: { id: book.getId() },
        });
        const creationDate = bookFound?.getCreationTime();
        book.setCreationTime(new Date(1));
        await bookRepo.save(generateContext({ upn: createdByUpn }), book);
        const bookFoundAfterCreationTimeChange = await bookRepo.findOne(generateContext(), {
            where: { id: book.getId() },
        });
        expect(creationDate).not.toStrictEqual(bookFoundAfterCreationTimeChange?.getCreationTime());
    });
});
