import * as express from 'express';
import http from 'http';

const port = 8090;
const app = express();
app.use(express.json());

app.get('/user/permissions/:upn/Real0/foo', (req, res) => {
    if (req.params.upn.startsWith('1')) {
        res.status(200).send({
            userPermissions: {
                foo: {
                    actions: {
                        READ: {
                            isPermitted: true,
                        },
                        DELETE: {
                            isPermitted: true,
                        },
                    },
                },
            },
        });
    } else {
        res.status(200).send({
            userPermissions: {
                foo: {
                    actions: {
                        READ: {
                            isPermitted: false,
                        },
                        DELETE: {
                            isPermitted: false,
                        },
                    },
                },
            },
        });
    }
});

app.get('/user/permissions/:upn/Real0/bar', (req, res) => {
    if (req.headers.bar) {
        res.status(200).send({
            userPermissions: {
                bar: {
                    actions: {
                        READ: {
                            isPermitted: true,
                        },
                        DELETE: {
                            isPermitted: true,
                        },
                    },
                },
            },
        });
    } else {
        res.status(200).send({
            userPermissions: {
                bar: {
                    actions: {
                        READ: {
                            isPermitted: false,
                        },
                        DELETE: {
                            isPermitted: false,
                        },
                    },
                },
            },
        });
    }
});

export async function startPermissionServer(): Promise<http.Server> {
    return app.listen(port);
}

export async function stopPermissionServer(server: http.Server): Promise<void> {
    await server.close();
}
