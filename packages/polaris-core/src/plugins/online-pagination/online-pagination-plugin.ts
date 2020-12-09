import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { PolarisServerConfig } from '../..';
import { OnlinePaginationListener } from './online-pagination-listener';

export class OnlinePaginationPlugin implements ApolloServerPlugin<PolarisGraphQLContext> {
    constructor(private readonly config: PolarisServerConfig) {}

    public requestDidStart(): GraphQLRequestListener<PolarisGraphQLContext> | void {
        return new OnlinePaginationListener(this.config);
    }
}
