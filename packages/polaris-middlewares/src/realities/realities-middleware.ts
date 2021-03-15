import {
    PolarisGraphQLContext,
    RealitiesHolder,
    UnsupportedRealityError,
} from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';

export class RealitiesMiddleware {
    public readonly logger: PolarisGraphQLLogger;
    private readonly realitiesHolder: RealitiesHolder;

    constructor(logger: PolarisGraphQLLogger, realitiesHolder: RealitiesHolder) {
        this.logger = logger;
        this.realitiesHolder = realitiesHolder;
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: any,
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            if (!this.realitiesHolder.hasReality(context.requestHeaders.realityId as number)) {
                throw new UnsupportedRealityError(context.requestHeaders.realityId as number);
            }
            const result = await resolve(root, args, context, info);
            if (result === undefined || result === null) {
                return result;
            }
            const operationalRealityId: number = 0;
            const realityId =
                (context && context.requestHeaders && context.requestHeaders.realityId) || 0;
            const noRealityIdOrSameAsHeader = (entity: any) =>
                entity.realityId === undefined || entity.realityId === realityId;
            const includeLinkedOperIsTrueAndEntityIsOper = (entity: any) =>
                context?.requestHeaders?.includeLinkedOper &&
                entity.realityId === operationalRealityId;
            if (Array.isArray(result)) {
                return root
                    ? result.filter(
                          (res) =>
                              noRealityIdOrSameAsHeader(res) ||
                              includeLinkedOperIsTrueAndEntityIsOper(res),
                      )
                    : result.filter(noRealityIdOrSameAsHeader);
            } else if (
                noRealityIdOrSameAsHeader(result) ||
                (root && includeLinkedOperIsTrueAndEntityIsOper(result))
            ) {
                return result;
            }
            return null;
        };
    }
}
