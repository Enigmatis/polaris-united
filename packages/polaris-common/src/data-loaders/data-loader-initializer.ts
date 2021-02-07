import * as DataLoader from 'dataloader';
import { PolarisGraphQLContext } from '../context/polaris-graphql-context';

export interface DataLoaderInitializer {
    initDataLoader(className: any, context: PolarisGraphQLContext): DataLoader<string, any>;
}
