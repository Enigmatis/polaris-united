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

export async function snapshotPageRoute(
    req: express.Request,
    polarisServerConfig: PolarisServerConfig,
    res: express.Response,
) {
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
}

export async function snapshotMetadataRoute(
    req: express.Request,
    polarisServerConfig: PolarisServerConfig,
    res: express.Response,
) {
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
    const result: any = await snapshotMetadataRepository.findOne(id);
    if (result) {
        await snapshotMetadataRepository.update(id, { id });
    }
    clean(result);
    res.send(JSON.stringify(result));
    await queryRunner.release();
}

export const createSnapshotRoutes = (polarisServerConfig: PolarisServerConfig): express.Router => {
    const router = express.Router();

    router.get('/', async (req: express.Request, res: express.Response) => {
        return snapshotPageRoute(req, polarisServerConfig, res);
    });

    router.get('/metadata', async (req: express.Request, res: express.Response) => {
        return snapshotMetadataRoute(req, polarisServerConfig, res);
    });

    return router;
};

function clean(obj: any): any {
    for (const propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
}
