import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import {
    PolarisGraphQLContext,
    ExpressContext,
    createPolarisSubscriptionsConfig,
    createPlaygroundConfig,
    createIntrospectionConfig,
    polarisFormatError,
    AbstractPolarisLogger,
    createPolarisContext,
    createPolarisPlugins,
    createPolarisSchemaWithMiddlewares,
    PolarisServerConfig,
    PolarisGraphQLLogger,
} from '@enigmatis/polaris-core';
import { SubscriptionServerOptions } from 'apollo-server-core/src/types';
import { PlaygroundConfig } from 'apollo-server';
import { PolarisServerConfigService } from "..";
import { Injectable } from '@nestjs/common';

@Injectable()
export class GqlOptionsFactoryService implements GqlOptionsFactory {
    constructor(private readonly configService: PolarisServerConfigService) {}
    createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
        const config: PolarisServerConfig = this.configService.getPolarisServerConfig();
        const logger: PolarisGraphQLLogger = (config.logger as unknown) as PolarisGraphQLLogger;
        const plugins = createPolarisPlugins(logger as any, config, config.connectionManager);
        const context: (context: ExpressContext) => PolarisGraphQLContext = createPolarisContext(
            (logger as unknown) as AbstractPolarisLogger,
            config,
        );
        const subscriptions:
            | Partial<SubscriptionServerOptions>
            | string
            | false = createPolarisSubscriptionsConfig(config);
        const playground: PlaygroundConfig = createPlaygroundConfig(config);
        const introspection: boolean | undefined = createIntrospectionConfig(config);
        return {
            installSubscriptionHandlers: config.allowSubscription,
            autoSchemaFile: true,
            playground,
            plugins: plugins as any,
            context,
            subscriptions,
            introspection,
            formatError: polarisFormatError,
            transformSchema: (schema: any) => {
                return createPolarisSchemaWithMiddlewares(
                    schema as any,
                    logger as any,
                    config,
                    config.connectionManager,
                );
            },
            path: config?.applicationProperties?.version,
            schemaDirectives: config?.schemaDirectives,
        };
    }
}
