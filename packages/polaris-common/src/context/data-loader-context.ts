import { DataLoaderHolder } from '../data-loaders/data-loader-holder';
import { DataLoaderInitializer } from '../data-loaders/data-loader-initializer';

export interface DataLoaderContext {
    dataLoaders?: DataLoaderHolder[];
    dataLoaderService: DataLoaderInitializer;
}
