import { PolarisConnection, SnapshotMetadata, SnapshotPage } from '@enigmatis/polaris-typeorm';
import { PolarisGraphQLContext, PolarisServerConfig } from '..';

export async function getSnapshotPageById(
    snapshotPageId: string,
    realityId: number,
    config: PolarisServerConfig,
    connection?: PolarisConnection,
): Promise<SnapshotPage | undefined> {
    if (config.connectionlessConfiguration) {
        return config.connectionlessConfiguration.getSnapshotPageById(snapshotPageId);
    } else {
        return connection?.getRepository(SnapshotPage).findOne({} as any, snapshotPageId);
    }
}

export async function getSnapshotMetadataById(
    snapshotMetadataId: string,
    realityId: number,
    config: PolarisServerConfig,
    connection: PolarisConnection,
): Promise<SnapshotMetadata | undefined> {
    if (config.connectionlessConfiguration) {
        return config.connectionlessConfiguration.getSnapshotMetadataById(snapshotMetadataId);
    } else {
        return connection?.getRepository(SnapshotMetadata).findOne({} as any, snapshotMetadataId);
    }
}

export async function saveSnapshotMetadata(
    config: PolarisServerConfig,
    context: PolarisGraphQLContext,
    pageCount: number,
    pagesIds: any[],
    connection?: PolarisConnection,
): Promise<SnapshotMetadata | undefined> {
    const snapshotMetadata = new SnapshotMetadata();
    snapshotMetadata.pagesIds = pagesIds;
    snapshotMetadata.dataVersion = context.returnedExtensions.globalDataVersion;
    snapshotMetadata.totalCount = context.snapshotContext?.totalCount!;
    snapshotMetadata.pagesCount = pageCount;
    if (config.connectionlessConfiguration) {
        return config.connectionlessConfiguration.saveSnapshotMetadata(snapshotMetadata);
    } else {
        const metadata = await connection
            ?.getRepository(SnapshotMetadata)
            .save({} as any, snapshotMetadata);
        return metadata instanceof Array ? metadata[0] : metadata;
    }
}

export async function saveSnapshotPages(
    snapshotPages: SnapshotPage[],
    config: PolarisServerConfig,
    connection?: PolarisConnection,
) {
    if (config.connectionlessConfiguration) {
        await config.connectionlessConfiguration.saveSnapshotPages(snapshotPages);
    } else {
        await connection?.getRepository(SnapshotPage).save({} as any, snapshotPages);
    }
}

export async function updateSnapshotPage(
    snapshotPageId: string,
    config: PolarisServerConfig,
    snapshotPageToUpdate: Partial<SnapshotPage>,
    connection?: PolarisConnection,
) {
    if (config.connectionlessConfiguration) {
        await config.connectionlessConfiguration.updateSnapshotPage(
            snapshotPageId,
            snapshotPageToUpdate,
        );
    } else {
        await connection
            ?.getRepository(SnapshotPage)
            .update({} as any, snapshotPageId, snapshotPageToUpdate);
    }
}

export async function updateSnapshotMetadata(
    snapshotMetadataId: string,
    config: PolarisServerConfig,
    snapshotMetadataToUpdate: Partial<SnapshotMetadata>,
    connection?: PolarisConnection,
) {
    if (config.connectionlessConfiguration) {
        await config.connectionlessConfiguration.updateSnapshotMetadata(
            snapshotMetadataId,
            snapshotMetadataToUpdate,
        );
    } else {
        await connection
            ?.getRepository(SnapshotMetadata)
            .update({} as any, snapshotMetadataId, snapshotMetadataToUpdate);
    }
}

export async function deleteSnapshotPageBySecondsToBeOutdated(
    secondsToBeOutdated: number,
    config: PolarisServerConfig,
    connection?: PolarisConnection,
) {
    if (config.connectionlessConfiguration) {
        await config.connectionlessConfiguration.deleteSnapshotPageBySecondsToBeOutdated(
            secondsToBeOutdated,
        );
    } else {
        const metadata = connection?.getMetadata(SnapshotPage);
        await connection?.getRepository(SnapshotPage)
            .query(`DELETE FROM "${metadata?.schema}".${metadata?.tableName} 
                                        WHERE EXTRACT(EPOCH FROM (NOW() - "lastAccessedTime")) > ${secondsToBeOutdated};`);
    }
}

export async function deleteSnapshotMetadataBySecondsToBeOutdated(
    secondsToBeOutdated: number,
    config: PolarisServerConfig,
    connection?: PolarisConnection,
) {
    if (config.connectionlessConfiguration) {
        await config.connectionlessConfiguration.deleteSnapshotMetadataBySecondsToBeOutdated(
            secondsToBeOutdated,
        );
    } else {
        const metadata = connection?.getMetadata(SnapshotMetadata);
        await connection?.getRepository(SnapshotMetadata)
            .query(`DELETE FROM "${metadata?.schema}".${metadata?.tableName} 
                                        WHERE EXTRACT(EPOCH FROM (NOW() - "lastAccessedTime")) > ${secondsToBeOutdated};`);
    }
}
