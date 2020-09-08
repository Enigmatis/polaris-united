import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { PolarisServerConfig } from '../..';
import { SnapshotListener } from './snapshot-listener';

export class SnapshotPlugin implements ApolloServerPlugin<PolarisGraphQLContext> {
    constructor(private readonly config: PolarisServerConfig) {}

    public requestDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext>,
    ): GraphQLRequestListener<PolarisGraphQLContext> | void {
        return new SnapshotListener(this.config);
    }
}
