import DataLoader = require('dataloader');
import { PolarisGraphQLContext } from '../context/polaris-graphql-context';

export interface DataLoaderInitializer {
    initDataLoader(
        realityId: number,
        className: any,
        context: PolarisGraphQLContext,
    ): DataLoader<string, any>;
}
