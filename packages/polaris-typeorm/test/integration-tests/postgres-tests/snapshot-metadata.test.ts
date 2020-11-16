import {
    PolarisConnection,
    PolarisRepository,
    SnapshotMetadata,
    SnapshotStatus,
} from '../../../src';
import { setUpTestConnection } from '../utils/set-up';
import { PolarisError } from '@enigmatis/polaris-common';

let connection: PolarisConnection;
let metadataRepository: PolarisRepository<SnapshotMetadata>;

beforeEach(async () => {
    connection = await setUpTestConnection();
    metadataRepository = connection.getRepository(SnapshotMetadata);
});

afterEach(async () => {
    await connection.close();
});
describe('snapshot page tests', () => {
    test(
        'saving snapshot metadata with warnings and errors,' +
            ' snapshot is saved with requested warnings and errors',
        async () => {
            const snapshotMetadata: SnapshotMetadata = new SnapshotMetadata();
            snapshotMetadata.addErrors([
                new PolarisError('error', 400),
                new PolarisError('error2', 400),
            ]);
            snapshotMetadata.addWarnings(['warning', new PolarisError('warning2', 400)]);
            await metadataRepository.save({} as any, snapshotMetadata);
            const metadata: SnapshotMetadata | undefined = await metadataRepository.findOne(
                {} as any,
                snapshotMetadata.id,
            );
            expect(metadata).toBeDefined();
            expect(metadata).not.toBeNull();
            expect(metadata?.currentPageIndex).toBe(0);
            expect(metadata?.pagesCount).toBe(0);
            expect(metadata?.pagesIds.length).toBe(0);
            expect(metadata!.getErrors()).toBe('error,error2');
            expect(metadata!.getWarnings()).toBe('warning,warning2');
            expect(metadata!.status).toBe(SnapshotStatus.IN_PROGRESS);
        },
    );
    test('adding warnings & errors, warnings & errors are added to metadata', async () => {
        const snapshotMetadata: SnapshotMetadata = new SnapshotMetadata();
        snapshotMetadata.addErrors([new PolarisError('error', 400)]);
        snapshotMetadata.addWarnings(['warning']);
        await metadataRepository.save({} as any, snapshotMetadata);
        snapshotMetadata.addErrors([new PolarisError('error2', 400)]);
        snapshotMetadata.addWarnings([new PolarisError('warning2', 400)]);
        await metadataRepository.save({} as any, snapshotMetadata);
        const metadata: SnapshotMetadata | undefined = await metadataRepository.findOne(
            {} as any,
            snapshotMetadata.id,
        );
        expect(metadata).toBeDefined();
        expect(metadata).not.toBeNull();
        expect(metadata?.currentPageIndex).toBe(0);
        expect(metadata?.pagesCount).toBe(0);
        expect(metadata?.pagesIds.length).toBe(0);
        expect(metadata!.getErrors()).toBe('error,error2');
        expect(metadata!.getWarnings()).toBe('warning,warning2');
        expect(metadata!.status).toBe(SnapshotStatus.IN_PROGRESS);
    });
});
