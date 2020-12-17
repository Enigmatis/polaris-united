import { Reality } from '@enigmatis/polaris-common';
import { getConnectionByConnectionlessConfiguration } from '@enigmatis/polaris-middlewares';
import { AbstractPolarisLogger } from '@enigmatis/polaris-logs';
import { PolarisServerConfig } from '../../index';
import {
    deleteSnapshotMetadataBySecondsToBeOutdated,
    deleteSnapshotPageBySecondsToBeOutdated,
} from '../../utils/snapshot-connectionless-util';

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
        try {
            const connection = getConnectionByConnectionlessConfiguration(
                reality.id,
                polarisServerConfig.supportedRealities,
                polarisServerConfig.connectionManager,
                polarisServerConfig.connectionlessConfiguration,
            );
            await deleteSnapshotPageBySecondsToBeOutdated(
                secondsToBeOutdated,
                polarisServerConfig,
                connection,
            );

            await deleteSnapshotMetadataBySecondsToBeOutdated(
                secondsToBeOutdated,
                polarisServerConfig,
                connection,
            );

            logger.debug(
                `Snapshot cleaner has deleted outdated pages for reality id ${reality.id}`,
            );
        } catch (e) {
            logger.error(`Snapshot cleaner has failed`);
        }
    });
};
