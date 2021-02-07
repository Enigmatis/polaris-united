import { Module } from '@nestjs/common';
import { QueryResolver } from '../resolvers/query.resolver';

@Module({
    providers: [QueryResolver],
})
export class QueryModule {}
