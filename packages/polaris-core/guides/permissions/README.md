# Permissions with Polaris

In this guide, we will explain how to the permissions functionality provided by polaris.

## Permissions directive

In order to apply permissions logic on a specific field, be sure to use permissions directive in your graphql schema.

Using classic graphql SDL(Schema Definition Language):

```
type Query {
    permissionsField: String @permissions(entityTypes: ["foo"], actions: ["READ", "DELETE"])
}
```

Using Nest.js:

```
@Query(() => String)
@Directive('@permissions(entityTypes: ["foo"], actions: ["READ", "DELETE"])')
public async permissionsField(): Promise<string> {
  return 'foo bar baz';
}
```

## Permissions Configuration

You can provide `polaris-server` with the following fields which provide additional functionality to the permission process.

-   **systemPermissionsFunction** (_(context: PolarisGraphQLContext, entityTypes: string[], actions: string[]) => boolean_) - Custom function that will help you determine the result of the permissions process.
-   **permissionsHeaders** (_string[]_) - List of request headers names that you would want to transfer to the permissions service.
-   **enablePermissions** (_boolean_) - Boolean value that determine if the external permissions service should be queried.

## Environment Variables

Polaris uses the following environment variables:

- **PERMISSION_SERVICE_URL**(required) - The external permissions service url.
- **PERMISSIONS_PROXY_HOST** - In case the external permissions service is behind a proxy server, define the proxy host using this variable.
- **PERMISSIONS_PROXY_PORT** - In case the external permissions service is behind a proxy server, define the proxy port using this variable.
