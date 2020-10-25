import {
    AbstractPolarisLogger,
    createIntrospectionConfig,
    createPlaygroundConfig,
    createPolarisContext,
    createPolarisPlugins,
    createPolarisSchemaWithMiddlewares,
    createPolarisSubscriptionsConfig,
    ExpressContext,
    PermissionsDirective,
    polarisFormatError,
    PolarisGraphQLContext,
    PolarisServerConfig,
} from '@enigmatis/polaris-core';
import { Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import { PlaygroundConfig } from 'apollo-server';
import { SubscriptionServerOptions } from 'apollo-server-core/src/types';
import { PolarisServerConfigService } from '..';

@Injectable()
export class GqlOptionsFactoryService implements GqlOptionsFactory {
    constructor(private readonly configService: PolarisServerConfigService) {}

    public createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
        const config: PolarisServerConfig = this.configService.getPolarisServerConfig();
        const plugins = createPolarisPlugins(config);
        const context: (context: ExpressContext) => PolarisGraphQLContext = createPolarisContext(
            (config.logger as unknown) as AbstractPolarisLogger,
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
