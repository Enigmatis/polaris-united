import { REALITY_ID } from '@enigmatis/polaris-common';
import {
    getConnectionForReality,
    PolarisConnectionManager,
    Repository,
    SnapshotMetadata,
    SnapshotPage,
    SnapshotStatus,
} from '@enigmatis/polaris-typeorm';
import * as express from 'express';
import { PolarisServerConfig } from '../..';

export const createSnapshotRoutes = (polarisServerConfig: PolarisServerConfig): express.Router => {
    const router = express.Router();

    router.get('/', async (req: express.Request, res: express.Response) => {
        const id = req.query.id as string;
        const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
        const realityId: number = realityHeader ? +realityHeader : 0;
        const queryRunner = getConnectionForReality(
            realityId,
            polarisServerConfig.supportedRealities as any,
            polarisServerConfig.connectionManager as PolarisConnectionManager,
        ).createQueryRunner();
        const snapshotPageRepository: Repository<SnapshotPage> = queryRunner.manager.getRepository(
            SnapshotPage,
        );
        const result = await snapshotPageRepository.findOne(id);
        if (!result) {
            res.send({});
        } else {
            await snapshotPageRepository.update(id, { id });
            const responseToSend =
                result!.status !== SnapshotStatus.DONE
                    ? { status: result!.status, id: result!.id }
                    : result!.getData();
            res.send(responseToSend);
        }
        await queryRunner.release();
    });

    router.get('/metadata', async (req: express.Request, res: express.Response) => {
        const id = req.query.id as string;
        const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
        const realityId: number = realityHeader ? +realityHeader : 0;
        const queryRunner = getConnectionForReality(
            realityId,
            polarisServerConfig.supportedRealities as any,
            polarisServerConfig.connectionManager as PolarisConnectionManager,
        ).createQueryRunner();
        const snapshotMetadataRepository: Repository<SnapshotMetadata> = queryRunner.manager.getRepository(
            SnapshotMetadata,
        );
        const result = await snapshotMetadataRepository.findOne(id);
        if (result) {
            await snapshotMetadataRepository.update(id, { id });
        }
        res.send(result);
        await queryRunner.release();
    });

    return router;
};
