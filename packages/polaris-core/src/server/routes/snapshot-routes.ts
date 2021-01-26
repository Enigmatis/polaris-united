import { REALITY_ID } from '@enigmatis/polaris-common';
import {
    getConnectionForReality,
    SnapshotMetadata,
    SnapshotStatus,
} from '@enigmatis/polaris-typeorm';
import * as express from 'express';
import { PolarisServerConfig } from '../..';
import {
    getSnapshotMetadataById,
    getSnapshotPageById,
} from '../../utils/snapshot-connectionless-util';

export async function snapshotPageRoute(
    req: express.Request,
    polarisServerConfig: PolarisServerConfig,
    res: express.Response,
) {
    const id = req.query.id as string;
    const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
    const realityId: number = realityHeader ? +realityHeader : 0;
    const connection = getConnection(realityId, polarisServerConfig, res);
    if (connection) {
        const result = await getSnapshotPageById(
            id,
            realityId,
            polarisServerConfig,
            connection as any,
        );
        if (!result) {
            res.send({ message: `Snapshot page with id ${id} not found` });
        } else {
            const responseToSend =
                result!.status !== SnapshotStatus.DONE
                    ? { status: result!.status, id: result!.id }
                    : result!.getData();
            res.send(responseToSend);
        }
    }
}

export async function snapshotMetadataRoute(
    req: express.Request,
    polarisServerConfig: PolarisServerConfig,
    res: express.Response,
) {
    const id = req.query.id as string;
    const realityHeader: string | string[] | undefined = req.headers[REALITY_ID];
    const realityId: number = realityHeader ? +realityHeader : 0;
    const connection = getConnection(realityId, polarisServerConfig, res);
    if (connection) {
        const result: SnapshotMetadata | undefined = await getSnapshotMetadataById(
            id,
            realityId,
            polarisServerConfig,
            connection as any,
        );
        if (result) {
            const formattedResult: any = { ...result };
            clean(formattedResult);
            if (result.errors) {
                formattedResult.errors = JSON.parse(result.errors.toString());
            }
            if (result.warnings) {
                formattedResult.warnings = JSON.parse(result.warnings.toString());
            }
            if (result.irrelevantEntities) {
                formattedResult.irrelevantEntities = JSON.parse(
                    result.irrelevantEntities.toString(),
                );
            }
            res.send(JSON.stringify(formattedResult));
        } else {
            res.send({ message: `Snapshot metadata with id ${id} not found` });
        }
    }
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

function getConnection(
    realityId: number,
    polarisServerConfig: PolarisServerConfig,
    res: express.Response,
) {
    let connection;
    try {
        connection = getConnectionForReality(
            realityId,
            polarisServerConfig.supportedRealities,
            polarisServerConfig.connectionManager as any,
        );
    } catch (error) {
        res.status(400).send(error.message);
    }
    return connection;
}

function clean(obj: any): any {
    for (const propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
}
