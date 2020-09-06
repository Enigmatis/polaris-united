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
        const runner = getConnectionForReality(
            realityId,
            polarisServerConfig.supportedRealities as any,
            config.connectionManager as PolarisConnectionManager,
        ).createQueryRunner();
        const snapshotRepository = runner.manager.getRepository(SnapshotPage);
        const result = await snapshotRepository.findOne(id);
        if (!result) {
            res.send({});
        } else {
            await snapshotRepository.update(id, { id });
            const responseToSend =
                result!.status !== SnapshotStatus.DONE
                    ? { status: result!.status, id: result!.id }
                    : result!.getData();
            res.send(responseToSend);
        }
        runner.release();
    });

    router.get('/metadata', async (req: express.Request, res: express.Response) => {
        const id = req.query.id as string;
        const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
        const realityId: number = realityHeader ? +realityHeader : 0;
        const runner = getConnectionForReality(
            realityId,
            polarisServerConfig.supportedRealities as any,
            config.connectionManager as PolarisConnectionManager,
        ).createQueryRunner();
        const snapshotMetadataRepository = runner.manager.getRepository(SnapshotMetadata);
        const result = await snapshotMetadataRepository.findOne(id);
        if (result) {
            await snapshotMetadataRepository.update(id, { id });
        }
        res.send(result);
        runner.release();
    });

    return router;
};
