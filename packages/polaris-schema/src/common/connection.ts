import { PageInfo } from './page-info';
import { Edge } from './edge';

export interface Connection<ENTITY> {
    pageInfo: PageInfo;
    edges: Edge<ENTITY>[];
}
