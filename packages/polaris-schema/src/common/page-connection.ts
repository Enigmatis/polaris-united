import { PageInfo } from './page-info';
import { Edge } from './edge';

export interface PageConnection<ENTITY> {
    pageInfo: PageInfo;
    edges: Edge<ENTITY>[];
}
