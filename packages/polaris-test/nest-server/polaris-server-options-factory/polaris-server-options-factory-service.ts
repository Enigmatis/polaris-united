import {
    getPolarisConnectionManager,
    PolarisServerOptions,
    RealitiesHolder,
} from '@enigmatis/polaris-core';
import { UpperCaseDirective } from '../common/directives/upper-case.directive';
import * as polarisProperties from '../resources/polaris-properties.json';
import { loggerConfig } from '../../test-utils/logger';
import { realitiesConfig } from '../../test-utils/realities-holder';
import { customContext } from '../../test-utils/custom-context';
export const createOptions: () => PolarisServerOptions = () => {
    return {
        typeDefs: [], // BY ANNOTATION
        resolvers: [], // BY ANNOTATION
        port: polarisProperties.port,
        schemaDirectives: { upper: UpperCaseDirective },
        logger: loggerConfig,
        supportedRealities: new RealitiesHolder(new Map(realitiesConfig)),
        connectionManager: getPolarisConnectionManager(),
        customContext,
    };
};
export const createOptionsFactory = () => createOptions();
