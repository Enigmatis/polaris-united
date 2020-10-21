import {PolarisGraphQLContext} from '@enigmatis/polaris-common';
import {PermissionsCacheHolder, PermissionsServiceWrapper} from '@enigmatis/polaris-permissions';
import {defaultFieldResolver, GraphQLField} from 'graphql';
import {SchemaDirectiveVisitor} from 'graphql-tools';

export class PermissionsDirective extends SchemaDirectiveVisitor {
    public visitFieldDefinition(field: GraphQLField<any, any>) {
        const {resolve = defaultFieldResolver} = field;
        const {entityTypes, actions} = this.args;
        field.resolve = async function (source, args, context, info) {
            await validatePermissions(context, entityTypes, actions);
            return resolve.apply(this, [source, args, context, info]);
        };
    }
}

export async function validatePermissions(
    context: PolarisGraphQLContext,
    entityTypes: string[],
    actions: string[],
): Promise<void> {
    if (context.requestHeaders.upn) {
        context.permissionsContext = {
            ...context.permissionsContext,
            digitalFilters: {},
            permissionsCacheHolder: new PermissionsCacheHolder(),
            portalData: undefined,
        };

        const permissionsServiceWrapper = new PermissionsServiceWrapper(
            context.permissionsContext.permissionsCacheHolder!,
        );
        const result = await permissionsServiceWrapper.getPermissionResult(
            context.requestHeaders.upn,
            'Real0',
            entityTypes,
            actions,
        );

        context.permissionsContext.digitalFilters = result.digitalFilters || {};
        context.permissionsContext.portalData = result.portalData || {};
        if (!result.isPermitted) {
            throw new Error('Forbidden');
        }
    } else if (
        context.requestHeaders.requestingSystemId &&
        context.permissionsContext?.systemPermissionsFunction &&
        !context.permissionsContext?.systemPermissionsFunction(context, entityTypes, actions)
    ) {
        throw new Error('Forbidden');
    }
}
