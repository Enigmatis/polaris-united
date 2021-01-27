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
            const errors = [new PolarisError('error', 400), new PolarisError('error2', 400)];
            const warnings = ['warning', new PolarisError('warning2', 400)];
            snapshotMetadata.addErrors(errors);
            snapshotMetadata.addWarnings(warnings);
            snapshotMetadata.addIrrelevantEntities({ allBooks: ['1', '2'] });
            await metadataRepository.save(snapshotMetadata);
            const metadata: SnapshotMetadata | undefined = await metadataRepository.findOne(
                snapshotMetadata.id,
            );
            expect(metadata).toBeDefined();
            expect(metadata).not.toBeNull();
            expect(metadata?.currentPageIndex).toBe(0);
            expect(metadata?.pagesCount).toBe(0);
            expect(metadata?.pagesIds.length).toBe(0);
            expect(metadata!.getIrrelevantEntities()).toEqual({ allBooks: ['1', '2'] });
            expect(metadata!.getErrors()).toEqual(JSON.stringify(errors));
            expect(metadata!.getWarnings()).toEqual(JSON.stringify(warnings));
            expect(metadata!.status).toBe(SnapshotStatus.IN_PROGRESS);
        },
    );
    test('adding warnings & errors, warnings & errors are added to metadata', async () => {
        const snapshotMetadata: SnapshotMetadata = new SnapshotMetadata();
        const errors = [new PolarisError('error', 400), new PolarisError('error2', 400)];
        const warnings = ['warning', new PolarisError('warning2', 400)];
        snapshotMetadata.addErrors([errors[0]]);
        snapshotMetadata.addWarnings([warnings[0]]);
        await metadataRepository.save(snapshotMetadata);
        snapshotMetadata.addErrors([errors[1]]);
        snapshotMetadata.addWarnings([warnings[1]]);
        await metadataRepository.save(snapshotMetadata);
        const metadata: SnapshotMetadata | undefined = await metadataRepository.findOne(
            snapshotMetadata.id,
        );
        expect(metadata).toBeDefined();
        expect(metadata).not.toBeNull();
        expect(metadata?.currentPageIndex).toBe(0);
        expect(metadata?.pagesCount).toBe(0);
        expect(metadata?.pagesIds.length).toBe(0);
        expect(metadata!.getErrors()).toEqual(JSON.stringify(errors));
        expect(metadata!.getWarnings()).toEqual(JSON.stringify(warnings));
        expect(metadata!.status).toBe(SnapshotStatus.IN_PROGRESS);
    });
});
