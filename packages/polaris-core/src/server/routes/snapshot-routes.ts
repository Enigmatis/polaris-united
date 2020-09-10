import { REALITY_ID } from '@enigmatis/polaris-common';
import { SnapshotStatus } from '@enigmatis/polaris-typeorm';
import * as express from 'express';
import { PolarisServerConfig } from '../..';
import {
    getQueryRunner,
    getSnapshotMetadataById,
    getSnapshotMetadataRepository,
    getSnapshotPageById,
    getSnapshotPageRepository,
    releaseQueryRunner,
    updateSnapshotMetadata,
    updateSnapshotPage,
} from '../../utils/snapshot-connectionless-util';

export const createSnapshotRoutes = (polarisServerConfig: PolarisServerConfig): express.Router => {
    const router = express.Router();

    router.get('/', async (req: express.Request, res: express.Response) => {
        const id = req.query.id as string;
        const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
        const realityId: number = realityHeader ? +realityHeader : 0;
        const queryRunner = getQueryRunner(realityId, polarisServerConfig);
        const snapshotPageRepository = getSnapshotPageRepository(polarisServerConfig, queryRunner);
        const result = await getSnapshotPageById(
            id,
            realityId,
            polarisServerConfig,
            snapshotPageRepository,
        );
        if (!result) {
            res.send({});
        } else {
            await updateSnapshotPage(
                result.id,
                polarisServerConfig,
                {
                    id: result.id,
                },
                snapshotPageRepository,
            );
            const responseToSend =
                result!.status !== SnapshotStatus.DONE
                    ? { status: result!.status, id: result!.id }
                    : result!.getData();
            res.send(responseToSend);
        }
        releaseQueryRunner(queryRunner);
    });

    router.get('/metadata', async (req: express.Request, res: express.Response) => {
        const id = req.query.id as string;
        const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
        const realityId: number = realityHeader ? +realityHeader : 0;
        const queryRunner = getQueryRunner(realityId, polarisServerConfig);
        const snapshotMetadataRepository = getSnapshotMetadataRepository(
            polarisServerConfig,
            queryRunner,
        );
        const result = await getSnapshotMetadataById(
            id,
            realityId,
            polarisServerConfig,
            snapshotMetadataRepository,
        );
        if (result) {
            await updateSnapshotMetadata(
                result.id,
                polarisServerConfig,
                {
                    id: result.id,
                },
                snapshotMetadataRepository,
            );
        }
        res.send(result);
        releaseQueryRunner(queryRunner);
    });

    return router;
};
