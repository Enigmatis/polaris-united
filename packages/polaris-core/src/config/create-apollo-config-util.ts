import {
    ApplicationProperties,
    DATA_VERSION,
    INCLUDE_LINKED_OPER,
    OICD_CLAIM_UPN,
    PolarisGraphQLContext,
    Reality,
    REALITY_ID,
    REQUEST_ID,
    REQUESTING_SYS,
    REQUESTING_SYS_NAME,
    PAGE_SIZE,
    SNAP_REQUEST,
    LAST_ID_IN_DV,
} from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { AbstractPolarisLogger, LoggerConfiguration } from '@enigmatis/polaris-logs';
import { PolarisLoggerPlugin, TransactionalRequestsPlugin } from '@enigmatis/polaris-middlewares';
import { PolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import { ApolloServer, PlaygroundConfig } from 'apollo-server-express';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { GraphQLSchema } from 'graphql';
import { applyMiddleware } from 'graphql-middleware';
import { merge, remove } from 'lodash';
import { v4 as uuid } from 'uuid';
import { ExpressContext } from '..';
import { getMiddlewaresMap } from '../middlewares/middlewares-map';
import { SnapshotMiddleware } from '../middlewares/snapshot-middleware';
import { ExtensionsPlugin } from '../plugins/extensions/extensions-plugin';
import { ResponseHeadersPlugin } from '../plugins/headers/response-headers-plugin';
import { SnapshotListener } from '../plugins/snapshot/snapshot-listener';
import { SnapshotPlugin } from '../plugins/snapshot/snapshot-plugin';
import { PolarisServerConfig } from './polaris-server-config';
import { OnlinePaginationMiddleware } from '../middlewares/online-pagination-middleware';
import { DataLoaderService } from '../data-loaders/data-loader-service';

export function createPolarisLoggerFromPolarisServerOptions(
    loggerDef: LoggerConfiguration | PolarisGraphQLLogger,
    applicationProperties: ApplicationProperties,
): PolarisGraphQLLogger {
    return loggerDef instanceof PolarisGraphQLLogger
        ? loggerDef
        : new PolarisGraphQLLogger(loggerDef as LoggerConfiguration, applicationProperties);
}

export function createPolarisPlugins(config: PolarisServerConfig): any[] {
    const plugins: any[] = [
        new ExtensionsPlugin(
            config.logger as PolarisGraphQLLogger,
            config.shouldAddWarningsToExtensions,
        ),
        new ResponseHeadersPlugin(config.logger as PolarisGraphQLLogger),
        new PolarisLoggerPlugin(config.logger as PolarisGraphQLLogger),
    ];
    if (config.connectionManager) {
        plugins.push(
            new TransactionalRequestsPlugin(
                config.logger as PolarisGraphQLLogger,
                config.supportedRealities,
                config.connectionManager,
            ),
        );
        plugins.push(new SnapshotPlugin(config));
    }
    if (config.plugins) {
        plugins.push(...config.plugins);
    }
    return plugins;
}

export function initSnapshotGraphQLOptions(
    config: PolarisServerConfig,
    server: ApolloServer,
    schema: GraphQLSchema,
): void {
    const plugins: any[] = createPolarisPlugins(config);
    remove(plugins, (plugin: ApolloServerPlugin) => plugin instanceof SnapshotPlugin);
    SnapshotListener.graphQLOptions = {
        ...server.requestOptions,
        plugins,
        schema,
    };
}

export function createPolarisMiddlewares(
    config: PolarisServerConfig,
    logger: PolarisGraphQLLogger,
    connectionManager?: PolarisConnectionManager,
): any[] {
    const allowedMiddlewares: any = [];
    const middlewareConfiguration = config.middlewareConfiguration;
    if (config.supportedRealities) {
        const middlewaresMap = getMiddlewaresMap(config, logger, connectionManager);
        for (const [key, value] of Object.entries({ ...middlewareConfiguration })) {
            if (value) {
                const middlewares = middlewaresMap.get(key);
                if (middlewares) {
                    middlewares.forEach((x) => allowedMiddlewares.push(x));
                }
            }
        }
        if (config.customMiddlewares) {
            return [...allowedMiddlewares, ...config.customMiddlewares];
        }
    }
    return allowedMiddlewares;
}

export function createPolarisSchemaWithMiddlewares(
    schema: GraphQLSchema,
    config: PolarisServerConfig,
) {
    applyMiddleware(
        schema,
        new SnapshotMiddleware(config.logger, config).getMiddleware(),
        new OnlinePaginationMiddleware(config.logger, config).getMiddleware(),
    );
    return applyMiddleware(
        schema,
        ...createPolarisMiddlewares(config, config.logger, config.connectionManager),
    );
}

export function createPolarisSubscriptionsConfig(config: PolarisServerConfig): any {
    return {
        path: `/${config.applicationProperties.version}/subscription`,
    };
}

const mandatoryHeadersErrorMessage = (headers: any): string => {
    const missingHeadersMessage = `Mandatory headers reality-id & requesting-sys are missing!`;
    const missingRequestingSysMessage = `Mandatory header requesting-sys is missing!`;
    const missingRealityIdMessage = `Mandatory header reality-id is missing!`;
    const missingRealityId = headers[REALITY_ID] === undefined;
    const missingRequestingSys = headers[REQUESTING_SYS] === undefined;
    if (missingRealityId && missingRequestingSys) {
        return missingHeadersMessage;
    } else {
        if (missingRealityId) {
            return missingRealityIdMessage;
        } else {
            return missingRequestingSysMessage;
        }
    }
};

export function createPolarisContext(logger: AbstractPolarisLogger, config: PolarisServerConfig) {
    return (context: ExpressContext): PolarisGraphQLContext => {
        const { req, connection } = context;
        const headers = req ? req.headers : connection?.context;
        const body = req ? req.body : connection;

        if (
            body.operationName !== 'IntrospectionQuery' &&
            config.allowMandatoryHeaders &&
            (headers[REALITY_ID] === undefined || headers[REQUESTING_SYS] === undefined)
        ) {
            const error = new Error(mandatoryHeadersErrorMessage(headers));
            logger.error(error.message);
            throw error;
        }

        const requestId = headers[REQUEST_ID] || uuid();
        const upn = headers[OICD_CLAIM_UPN];
        const realityId = +headers[REALITY_ID] || 0;
        const snapRequest = headers[SNAP_REQUEST] === 'true';
        const pageSize = +headers[PAGE_SIZE];
        const lastIdInDV = headers[LAST_ID_IN_DV];
        const reality: Reality | undefined = config.supportedRealities?.getReality(realityId);
        if (!reality) {
            const error = new Error('Requested reality is not supported!');
            logger.error(error.message);
            throw error;
        }

        const permissionsHeaders: { [headerName: string]: string } = {};
        config.permissionsConfig.permissionsHeaders?.forEach((permissionsHeaderName) => {
            if (headers[permissionsHeaderName]) {
                permissionsHeaders[permissionsHeaderName] = headers[permissionsHeaderName];
            }
        });

        const baseContext: PolarisGraphQLContext = {
            reality,
            requestHeaders: {
                upn,
                requestId,
                realityId,
                snapRequest,
                pageSize,
                lastIdInDV,
                dataVersion: +headers[DATA_VERSION],
                includeLinkedOper: headers[INCLUDE_LINKED_OPER] === 'true',
                requestingSystemId: headers[REQUESTING_SYS],
                requestingSystemName: headers[REQUESTING_SYS_NAME],
            },
            responseHeaders: {
                upn,
                requestId,
                realityId,
            },
            clientIp: req?.ip,
            request: {
                query: body.query,
                operationName: body.operationName,
                variables: body.variables,
            },
            returnedExtensions: {} as any,
            permissionsContext: {
                systemPermissionsFunction: config.permissionsConfig.systemPermissionsFunction,
                permissionsHeaders,
                enablePermissions: config.permissionsConfig.enablePermissions,
            },
            dataloaderContext: {
                dataLoaderService: new DataLoaderService(
                    config.supportedRealities,
                    config.connectionManager,
                ),
            },
        };

        if (config.customContext) {
            const customContext = config.customContext(context);
            return merge(customContext, baseContext);
        } else {
            return baseContext;
        }
    };
}

export function createPlaygroundConfig(config: PolarisServerConfig): PlaygroundConfig {
    return isProduction(config)
        ? false
        : { cdnUrl: '', version: config.applicationProperties.version };
}

export function createIntrospectionConfig(config: PolarisServerConfig): boolean {
    return !isProduction(config);
}

export function isProduction(config: PolarisServerConfig): boolean {
    const environment: string | undefined = config.applicationProperties.environment;
    return environment === 'prod' || environment === 'production';
}
