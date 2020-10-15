import {
    getPolarisConnectionManager,
    PolarisServerOptions,
    RealitiesHolder,
} from '@enigmatis/polaris-core';
import { UpperCaseDirective } from '../../shared-resources/directives/upper-case-directive';
import * as polarisProperties from '../../shared-resources/polaris-properties.json';
import { polarisGraphQLLogger } from '../../shared-resources/logger';
import { realitiesConfig } from '../../shared-resources/realities-holder';
import { customContext } from '../../shared-resources/context/custom-context';
export const createOptions: () => PolarisServerOptions = () => {
    return {
        typeDefs: [], // BY ANNOTATION
        resolvers: [], // BY ANNOTATION
        port: polarisProperties.port,
        schemaDirectives: { upper: UpperCaseDirective },
        logger: polarisGraphQLLogger,
        supportedRealities: new RealitiesHolder(new Map(realitiesConfig)),
        connectionManager: getPolarisConnectionManager(),
        customContext,
    };
};
export const createOptionsFactory = () => createOptions();
