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
    PermissionsDirective,
} from '@enigmatis/polaris-core';
import { SubscriptionServerOptions } from 'apollo-server-core/src/types';
import { PlaygroundConfig } from 'apollo-server';
import { PolarisServerConfigService } from '../polaris-server-config/polaris-server-config.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GqlOptionsFactoryService implements GqlOptionsFactory {
    constructor(private readonly configService: PolarisServerConfigService) {}
    createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
        const config: PolarisServerConfig = this.configService.getPolarisServerConfig();
        const logger: PolarisGraphQLLogger = (config.logger as unknown) as PolarisGraphQLLogger;
        const plugins = createPolarisPlugins(config);
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
        let schemaDirectives = config.schemaDirectives;
        schemaDirectives
            ? (schemaDirectives.permissions = PermissionsDirective)
            : (schemaDirectives = { permissions: PermissionsDirective });
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
                return createPolarisSchemaWithMiddlewares(schema as any, config);
            },
            path: config?.applicationProperties?.version,
            schemaDirectives,
        };
    }
}
