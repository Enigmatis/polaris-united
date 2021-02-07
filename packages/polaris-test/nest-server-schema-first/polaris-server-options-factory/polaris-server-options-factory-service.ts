import {
    getPolarisConnectionManager,
    PolarisNestSchemaFirstOptions,
    RealitiesHolder,
} from '@enigmatis/polaris-core';
import { UpperCaseDirective } from '../../shared-resources/directives/upper-case-directive';
import * as polarisProperties from '../../shared-resources/polaris-properties.json';
import { polarisGraphQLLogger } from '../../shared-resources/logger';
import { realitiesConfig } from '../../shared-resources/realities-holder';
import { customContext } from '../../shared-resources/context/custom-context';
import { join } from 'path';
export const createOptions: () => PolarisNestSchemaFirstOptions = () => {
    return {
        gqlModuleOptions: {
            typePaths: ['./**/*.graphql'],
            definitions: {
                path: join(process.cwd(), 'nest-server-schema-first/graphql.ts'),
                emitTypenameField: true,
                outputAs: 'class',
            },
        },
        port: polarisProperties.port,
        schemaDirectives: { upper: UpperCaseDirective },
        logger: polarisGraphQLLogger,
        supportedRealities: new RealitiesHolder(new Map(realitiesConfig)),
        connectionManager: getPolarisConnectionManager(),
        customContext,
    };
};
export const createOptionsFactory = () => createOptions();
