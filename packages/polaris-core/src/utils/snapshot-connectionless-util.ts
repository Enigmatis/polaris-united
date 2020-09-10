import {
    getConnectionForReality,
    PolarisConnectionManager,
    PolarisRepository,
    QueryRunner,
    Repository,
    SnapshotMetadata,
    SnapshotPage,
} from '@enigmatis/polaris-typeorm';
import { PolarisServerConfig } from '..';

export function releaseQueryRunner(queryRunner?: QueryRunner): void {
    if (queryRunner) {
        queryRunner.release();
    }
}

export function getQueryRunner(
    realityId: number,
    config: PolarisServerConfig,
): QueryRunner | undefined {
    return config.connectionLessConfiguration
        ? undefined
        : getConnectionForReality(
              realityId,
              config.supportedRealities as any,
              config.connectionManager as PolarisConnectionManager,
          ).createQueryRunner();
}

export function getSnapshotPageRepository(
    config: PolarisServerConfig,
    queryRunner?: QueryRunner,
): Repository<SnapshotPage> | undefined {
    return config.connectionLessConfiguration
        ? undefined
        : queryRunner?.manager.getRepository(SnapshotPage);
}

export function getSnapshotMetadataRepository(
    config: PolarisServerConfig,
    queryRunner?: QueryRunner,
): Repository<SnapshotMetadata> | undefined {
    return config.connectionLessConfiguration
        ? undefined
        : queryRunner?.manager.getRepository(SnapshotMetadata);
}

export async function getSnapshotPageById(
    snapshotPageId: string,
    realityId: number,
    config: PolarisServerConfig,
    snapshotPageRepository?: Repository<SnapshotPage>,
): Promise<SnapshotPage | undefined> {
    if (config.connectionLessConfiguration) {
        return config.connectionLessConfiguration.getSnapshotPageById(snapshotPageId);
    } else {
        return snapshotPageRepository?.findOne(snapshotPageId);
    }
}

export async function getSnapshotMetadataById(
    snapshotMetadataId: string,
    realityId: number,
    config: PolarisServerConfig,
    snapshotMetadataRepository?: Repository<SnapshotMetadata>,
): Promise<SnapshotMetadata | undefined> {
    if (config.connectionLessConfiguration) {
        return config.connectionLessConfiguration.getSnapshotMetadataById(snapshotMetadataId);
    } else {
        return snapshotMetadataRepository?.findOne(snapshotMetadataId);
    }
}

export async function saveSnapshotMetadata(
    snapshotMetadataToSave: SnapshotMetadata,
    config: PolarisServerConfig,
    snapshotMetadataRepository?: Repository<SnapshotMetadata>,
) {
    if (config.connectionLessConfiguration) {
        const snapshotMetadata = await config.connectionLessConfiguration.saveSnapshotMetadata(
            snapshotMetadataToSave,
        );
        Object.assign(snapshotMetadataToSave, { id: snapshotMetadata.id });
    } else {
        await snapshotMetadataRepository?.save(snapshotMetadataToSave);
    }
}

export async function saveSnapshotPages(
    snapshotPages: SnapshotPage[],
    config: PolarisServerConfig,
    snapshotPageRepository?: Repository<SnapshotPage>,
) {
    if (config.connectionLessConfiguration) {
        config.connectionLessConfiguration.saveSnapshotPages(snapshotPages);
    } else {
        await snapshotPageRepository?.save(snapshotPages);
    }
}

export async function updateSnapshotPage(
    snapshotPageId: string,
    config: PolarisServerConfig,
    snapshotPageToUpdate: Partial<SnapshotPage>,
    snapshotPageRepository?: Repository<SnapshotPage>,
) {
    if (config.connectionLessConfiguration) {
        config.connectionLessConfiguration.updateSnapshotPage(snapshotPageId, snapshotPageToUpdate);
    } else {
        snapshotPageRepository?.update(snapshotPageId, snapshotPageToUpdate);
    }
}

export async function updateSnapshotMetadata(
    snapshotMetadataId: string,
    config: PolarisServerConfig,
    snapshotMetadataToUpdate: Partial<SnapshotMetadata>,
    snapshotMetadataRepository?: Repository<SnapshotMetadata>,
) {
    if (config.connectionLessConfiguration) {
        config.connectionLessConfiguration.updateSnapshotMetadata(
            snapshotMetadataId,
            snapshotMetadataToUpdate,
        );
    } else {
        snapshotMetadataRepository?.update(snapshotMetadataId, snapshotMetadataToUpdate);
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
