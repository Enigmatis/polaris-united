import { Plugin } from '@nestjs/graphql';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
    public requestDidStart(): GraphQLRequestListener {
        // tslint:disable-next-line:no-console
        console.log('Request started');
        return {
            willSendResponse() {
                // tslint:disable-next-line:no-console
                console.log('Will send response');
            },
        };
    }
}
