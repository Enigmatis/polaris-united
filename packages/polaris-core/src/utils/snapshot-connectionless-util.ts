import {
    getConnectionForReality,
    PolarisConnectionManager,
    PolarisRepository,
    SnapshotMetadata,
    SnapshotPage,
} from '@enigmatis/polaris-typeorm';
import {PolarisServerConfig} from '..';

export function getSnapshotPageRepository(
    realityId: number,
    config: PolarisServerConfig,
): PolarisRepository<SnapshotPage> | undefined {
    return config.connectionLessConfiguration
        ? undefined
        : getConnectionForReality(
            realityId,
            config.supportedRealities as any,
            config.connectionManager as PolarisConnectionManager,
        ).getRepository(SnapshotPage);
}

export function getSnapshotMetadataRepository(
    realityId: number,
    config: PolarisServerConfig,
): PolarisRepository<SnapshotMetadata> | undefined {
    return config.connectionLessConfiguration
        ? undefined
        : getConnectionForReality(
            realityId,
            config.supportedRealities as any,
            config.connectionManager as PolarisConnectionManager,
        ).getRepository(SnapshotMetadata);
}

export async function getSnapshotPageById(
    snapshotPageId: string,
    realityId: number,
    config: PolarisServerConfig,
    snapshotPageRepository?: PolarisRepository<SnapshotPage>,
): Promise<SnapshotPage | undefined> {
    if (config.connectionLessConfiguration) {
        return config.connectionLessConfiguration.getSnapshotPageById(snapshotPageId);
    } else {
        return snapshotPageRepository?.findOne({} as any, snapshotPageId);
    }
}

export async function getSnapshotMetadataById(
    snapshotMetadataId: string,
    realityId: number,
    config: PolarisServerConfig,
    snapshotMetadataRepository?: PolarisRepository<SnapshotMetadata>,
): Promise<SnapshotMetadata | undefined> {
    if (config.connectionLessConfiguration) {
        return config.connectionLessConfiguration.getSnapshotMetadataById(snapshotMetadataId);
    } else {
        return snapshotMetadataRepository?.findOne({} as any, snapshotMetadataId);
    }
}

export async function saveSnapshotMetadata(
    snapshotMetadataToSave: SnapshotMetadata,
    config: PolarisServerConfig,
    snapshotMetadataRepository?: PolarisRepository<SnapshotMetadata>,
) {
    if (config.connectionLessConfiguration) {
        config.connectionLessConfiguration.saveSnapshotMetadata(snapshotMetadataToSave);
    } else {
        await snapshotMetadataRepository?.save({} as any, snapshotMetadataToSave);
    }
}

export async function updateSnapshotPage(
    snapshotPageId: string,
    config: PolarisServerConfig,
    snapshotPageToUpdate: Partial<SnapshotPage>,
    snapshotPageRepository?: PolarisRepository<SnapshotPage>,
) {
    if (config.connectionLessConfiguration) {
        config.connectionLessConfiguration.updateSnapshotPage(snapshotPageId, snapshotPageToUpdate);
    } else {
        snapshotPageRepository?.update({} as any, snapshotPageId, snapshotPageToUpdate);
    }
}

export async function updateSnapshotMetadata(
    snapshotMetadataId: string,
    config: PolarisServerConfig,
    snapshotMetadataToUpdate: Partial<SnapshotMetadata>,
    snapshotMetadataRepository?: PolarisRepository<SnapshotMetadata>,
) {
    if (config.connectionLessConfiguration) {
        config.connectionLessConfiguration.updateSnapshotMetadata(
            snapshotMetadataId,
            snapshotMetadataToUpdate,
        );
    } else {
        snapshotMetadataRepository?.update({} as any, snapshotMetadataId, snapshotMetadataToUpdate);
    }
}

export async function deleteSnapshotPageBySecondsToBeOutdated(
    secondsToBeOutdated: number,
    config: PolarisServerConfig,
    snapshotPageRepository?: PolarisRepository<SnapshotPage>,
) {
    if (config.connectionLessConfiguration) {
        config.connectionLessConfiguration.deleteSnapshotPageBySecondsToBeOutdated(
            secondsToBeOutdated,
        );
    } else {
        snapshotPageRepository?.query(`DELETE FROM "${snapshotPageRepository.metadata.schema}".${snapshotPageRepository.metadata.tableName} 
                                        WHERE EXTRACT(EPOCH FROM (NOW() - "lastAccessedTime")) > ${secondsToBeOutdated};`);
    }
}

export async function deleteSnapshotMetadataBySecondsToBeOutdated(
    secondsToBeOutdated: number,
    config: PolarisServerConfig,
    snapshotMetadataRepository?: PolarisRepository<SnapshotMetadata>,
) {
    if (config.connectionLessConfiguration) {
        config.connectionLessConfiguration.deleteSnapshotMetadataBySecondsToBeOutdated(
            secondsToBeOutdated,
        );
    } else {
        snapshotMetadataRepository?.query(`DELETE FROM "${snapshotMetadataRepository.metadata.schema}".${snapshotMetadataRepository.metadata.tableName} 
                                        WHERE EXTRACT(EPOCH FROM (NOW() - "lastAccessedTime")) > ${secondsToBeOutdated};`);
    }
}
