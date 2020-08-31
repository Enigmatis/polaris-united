import { REALITY_ID } from '@enigmatis/polaris-common';
import {
    getConnectionForReality,
    PolarisConnectionManager,
    SnapshotMetadata,
    SnapshotPage,
    SnapshotStatus,
} from '@enigmatis/polaris-typeorm';
import * as express from 'express';
import { PolarisServerConfig, PolarisServerOptions } from '../..';

export const createSnapshotRoutes = (
    polarisServerConfig: PolarisServerConfig,
    config: PolarisServerOptions,
): express.Router => {
    const router = express.Router();

    router.get('/', async (req: express.Request, res: express.Response) => {
        const id = req.query.id as string;
        const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
        const realityId: number = realityHeader ? +realityHeader : 0;
        const snapshotRepository = getConnectionForReality(
            realityId,
            polarisServerConfig.supportedRealities as any,
            config.connectionManager as PolarisConnectionManager,
        ).getRepository(SnapshotPage);
        const result = await snapshotRepository.findOne({} as any, id);
        if (!result) {
            res.send({});
        } else {
            await snapshotRepository.update({} as any, id, { id });
            const responseToSend =
                result!.status !== SnapshotStatus.DONE
                    ? { status: result!.status, id: result!.id }
                    : result!.getData();
            res.send(responseToSend);
        }
    });

    router.get('/metadata', async (req: express.Request, res: express.Response) => {
        const id = req.query.id as string;
        const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
        const realityId: number = realityHeader ? +realityHeader : 0;
        const snapshotMetadataRepository = getConnectionForReality(
            realityId,
            polarisServerConfig.supportedRealities as any,
            config.connectionManager as PolarisConnectionManager,
        ).getRepository(SnapshotMetadata);
        const result = await snapshotMetadataRepository.findOne({} as any, id);
        if (result) {
            await snapshotMetadataRepository.update({} as any, id, { id });
        }
        res.send(result);
    });

    return router;
};
