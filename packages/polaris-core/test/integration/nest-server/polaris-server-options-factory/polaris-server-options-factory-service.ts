import {
    ExpressContext,
    getPolarisConnectionManager,
    PolarisServerOptions,
    RealitiesHolder,
} from '../../../../src';
import { UpperCaseDirective } from '../common/directives/upper-case.directive';
import * as customContextFields from '../constants/custom-context-fields.json';
import { TestClassInContext } from '../context/test-class-in-context';
import { TestContext } from '../context/test-context';
import * as polarisProperties from '../resources/polaris-properties.json';
import { polarisGraphQLLogger } from '../utils/logger';
export const createOptions: () => PolarisServerOptions = () => {
    return {
        typeDefs: [], // BY ANNOTATION
        resolvers: [], // BY ANNOTATION
        port: polarisProperties.port,
        applicationProperties: {
            id: polarisProperties.id,
            name: polarisProperties.name,
            version: polarisProperties.version,
            environment: polarisProperties.environment,
            component: polarisProperties.component,
        },
        schemaDirectives: { upper: UpperCaseDirective },
        logger: polarisGraphQLLogger,
        supportedRealities: new RealitiesHolder(
            new Map([[3, { id: 3, type: 'notreal3', name: 'default' }]]),
        ),
        connectionManager: getPolarisConnectionManager(),
        customContext: (context: ExpressContext): Partial<TestContext> => {
            const { req, connection } = context;
            const headers = req ? req.headers : connection?.context;

            return {
                customField: customContextFields.customField,
                instanceInContext: new TestClassInContext(
                    customContextFields.instanceInContext.someProperty,
                ),
                requestHeaders: {
                    customHeader: headers['custom-header'],
                },
            };
        },
    };
};
export const createOptionsFactory = () => createOptions();
