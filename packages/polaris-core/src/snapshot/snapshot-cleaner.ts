import { Reality } from '@enigmatis/polaris-common';
import { AbstractPolarisLogger } from '@enigmatis/polaris-logs';
import { PolarisServerConfig } from '..';
import {
    deleteSnapshotMetadataBySecondsToBeOutdated,
    deleteSnapshotPageBySecondsToBeOutdated,
    getSnapshotMetadataRepository,
    getSnapshotPageRepository,
} from '../utils/snapshot-connectionless-util';

let snapshotCleanerInterval: NodeJS.Timeout;

export const setSnapshotCleanerInterval = (
    polarisServerConfig: PolarisServerConfig,
    polarisLogger: AbstractPolarisLogger,
): void => {
    snapshotCleanerInterval = global.setInterval(
        () =>
            deleteOutdatedSnapshotPagesAndMetadata(
                polarisServerConfig,
                polarisLogger,
                polarisServerConfig.snapshotConfig.secondsToBeOutdated,
            ),
        polarisServerConfig.snapshotConfig.snapshotCleaningInterval * 1000,
    );
};

export const clearSnapshotCleanerInterval = (): void => {
    if (snapshotCleanerInterval) {
        clearInterval(snapshotCleanerInterval);
    }
};

const deleteOutdatedSnapshotPagesAndMetadata = (
    polarisServerConfig: PolarisServerConfig,
    logger: AbstractPolarisLogger,
    secondsToBeOutdated: number,
): void => {
    polarisServerConfig.supportedRealities.getRealitiesMap().forEach(async (reality: Reality) => {
        const snapshotPageRepository = getSnapshotPageRepository(reality.id, polarisServerConfig);
        const snapshotMetadataRepository = getSnapshotMetadataRepository(
            reality.id,
            polarisServerConfig,
        );

        await deleteSnapshotPageBySecondsToBeOutdated(
            secondsToBeOutdated,
            polarisServerConfig,
            snapshotPageRepository,
        );

        await deleteSnapshotMetadataBySecondsToBeOutdated(
            secondsToBeOutdated,
            polarisServerConfig,
            snapshotMetadataRepository,
        );

        logger.debug(`Snapshot cleaner has deleted outdated pages for reality id ${reality.id}`);
    });
};
