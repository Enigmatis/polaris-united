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

export async function snapshotPageRoute(
    req: express.Request,
    polarisServerConfig: PolarisServerConfig,
    res: express.Response,
) {
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
}

export async function snapshotMetadataRoute(
    req: express.Request,
    polarisServerConfig: PolarisServerConfig,
    res: express.Response,
) {
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
    clean(result);
    res.send(JSON.stringify(result));
    releaseQueryRunner(queryRunner);
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
