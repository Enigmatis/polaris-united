import {CommonModel, PolarisCriteria} from '../../../src';
import {SoftDeleteHandler} from '../../../src/handlers/soft-delete-handler';
import {Book} from '../../dal/book';
import {Library} from '../../dal/library';

let connection: any;
let metadata: any;

describe('soft delete handler tests', () => {
    beforeEach(() => {
        metadata = {
            target: Library,
            inheritanceTree: [Library],
        } as any;
        metadata.relations = [
            {
                inverseEntityMetadata: {
                    targetName: Book,
                    foreignKeys: [
                        {
                            referencedEntityMetadata: metadata,
                        },
                    ],
                },
                propertyName: 'books',
            },
        ];
        const execute = jest.fn();
        execute
            .mockResolvedValueOnce({ affected: 1, raw: [{ id: 1 }] })
            .mockResolvedValueOnce({ affected: 0, raw: [] });
        const returningAndExecuteMock = jest.fn(() => {
            return {
                returning: jest.fn(() => {
                    return {
                        execute,
                    };
                }),
            };
        });
        connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
                save: jest.fn(),
                connection: {
                    getMetadata: jest.fn(() => metadata),
                    options: { type: 'postgres' },
                },
                createQueryBuilder: jest.fn(() => {
                    return {
                        update: jest.fn(() => {
                            return {
                                set: jest.fn(() => {
                                    return {
                                        where: jest.fn(returningAndExecuteMock),
                                        whereInIds: jest.fn(returningAndExecuteMock),
                                    };
                                }),
                            };
                        }),
                    };
                }),
            },
        } as any;
    });
    it('field is not common model, does not delete linked entity', async () => {
        metadata.relations[0].inverseEntityMetadata.inheritanceTree = [];
        metadata.relations[0].inverseEntityMetadata.foreignKeys[0].onDelete = 'CASCADE';
        const softDeleteHandler = new SoftDeleteHandler();
        const lib = new Library('library');
        await softDeleteHandler.softDeleteRecursive(
            Library,
            new PolarisCriteria(lib, {} as any),
            connection.manager,
        );
        expect(connection.manager.createQueryBuilder).toBeCalledTimes(1);
    });
    it('field is common model and cascade is on, delete linked entity', async () => {
        metadata.relations[0].inverseEntityMetadata.inheritanceTree = [Book, CommonModel];
        metadata.relations[0].inverseEntityMetadata.foreignKeys[0].onDelete = 'CASCADE';
        const softDeleteHandler = new SoftDeleteHandler();
        const lib = new Library('library');
        await softDeleteHandler.softDeleteRecursive(
            Library,
            new PolarisCriteria(lib, {} as any),
            connection.manager,
        );
        expect(connection.manager.createQueryBuilder).toBeCalledTimes(2);
    });
    it('field is common model but cascade is not on, does not delete linked entity', async () => {
        metadata.relations[0].inverseEntityMetadata.inheritanceTree = [Book, CommonModel];
        metadata.relations[0].inverseEntityMetadata.foreignKeys[0].onDelete = '';
        const softDeleteHandler = new SoftDeleteHandler();
        const lib = new Library('library');
        await softDeleteHandler.softDeleteRecursive(
            Library,
            new PolarisCriteria(lib, {} as any),
            connection.manager,
        );
        expect(connection.manager.createQueryBuilder).toBeCalledTimes(1);
    });
    it('should call find and update if driver is not postgres or mssql', async () => {
        const lib = new Library('library');
        metadata.relations[0].inverseEntityMetadata.inheritanceTree = [Book, CommonModel];
        metadata.relations[0].inverseEntityMetadata.foreignKeys[0].onDelete = '';
        const afterDelete = [{ ...lib, deleted: true, lastUpdatedBy: undefined }];
        connection = {
            manager: {
                queryRunner: { data: { requestHeaders: {} } },
                save: jest.fn(),
                connection: {
                    getMetadata: jest.fn(() => metadata),
                    options: { type: 'sqlite' },
                },
                find: jest.fn(() => [lib]),
            },
        } as any;
        const softDeleteHandler = new SoftDeleteHandler();
        await softDeleteHandler.softDeleteRecursive(
            Library,
            new PolarisCriteria(lib, {} as any),
            connection.manager,
        );
        expect(connection.manager.find).toBeCalledTimes(1);
        expect(connection.manager.save).toBeCalledTimes(1);
        expect(connection.manager.save).toBeCalledWith(Library, afterDelete);
    });
});
